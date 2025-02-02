import { auth, db } from './auth.js';
import { 
  collection,
  query, 
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp 
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Export the main function
export async function loadGoals() {
  const userId = auth.currentUser.uid;
  const types = ['daily', 'weekly', 'monthly'];

  types.forEach(async type => {
    const listElement = document.getElementById(`${type}-goals-list`);
    listElement.innerHTML = '';

    try {
      const goalsQuery = query(
        collection(db, 'goals'),
        where('userId', '==', userId),
        where('type', '==', type),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(goalsQuery);
      
      snapshot.forEach(doc => {
        const goal = doc.data();
        const goalElement = document.createElement('div');
        goalElement.className = 'goal-item';
        goalElement.innerHTML = `
          <input type="checkbox" ${goal.completed ? 'checked' : ''} 
            onchange="toggleGoal('${doc.id}', this.checked)">
          <span class="${goal.completed ? 'completed' : ''}">${goal.description}</span>
          <button onclick="deleteGoal('${doc.id}')" class="delete-btn">
            <i class="fas fa-trash"></i>
          </button>
        `;
        
        listElement.appendChild(goalElement);
      });
    } catch (error) {
      console.error('Error loading goals:', error);
      listElement.innerHTML = '<p>Error cargando objetivos. Intenta de nuevo más tarde.</p>';
    }
  });
}

async function addGoal(type) {
  const input = document.getElementById(`${type}-goal`);
  const goal = input.value.trim();
  
  if (!goal) return;

  const userId = auth.currentUser.uid;

  try {
    await addDoc(collection(db, 'goals'), {
      userId: userId,
      type: type,
      description: goal,
      completed: false,
      createdAt: Timestamp.now()
    });

    input.value = '';
    loadGoals();
  } catch (error) {
    alert('Error al guardar el objetivo: ' + error.message);
  }
}

async function toggleGoal(goalId, completed) {
  try {
    await updateDoc(doc(db, 'goals', goalId), {
      completed: completed
    });
    loadGoals();
  } catch (error) {
    alert('Error al actualizar el objetivo: ' + error.message);
  }
}

async function deleteGoal(goalId) {
  if (confirm('¿Estás seguro de que quieres eliminar este objetivo?')) {
    try {
      await deleteDoc(doc(db, 'goals', goalId));
      loadGoals();
    } catch (error) {
      alert('Error al eliminar el objetivo: ' + error.message);
    }
  }
}

// Make all functions available globally
window.loadGoals = loadGoals;
window.addGoal = addGoal;
window.toggleGoal = toggleGoal;
window.deleteGoal = deleteGoal;