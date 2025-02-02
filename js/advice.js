import { auth, db } from './auth.js';

// Export the main function
export async function loadAdvice() {
  const userId = auth.currentUser.uid;

  try {
    // Obtener el último estado de ánimo
    const moodSnapshot = await db.collection('moods')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (!moodSnapshot.empty) {
      const lastMood = moodSnapshot.docs[0].data().mood;
      const moodAdvice = adviceData[lastMood] || adviceData.neutral;
      
      document.getElementById('mood-advice-content').innerHTML = `
        <p class="current-mood">Tu estado actual: ${getMoodEmoji(lastMood)}</p>
        <ul>
          ${moodAdvice.map(advice => `<li>${advice}</li>`).join('')}
        </ul>
      `;
    }

    // Cargar consejos generales
    loadGeneralAdvice();
  } catch (error) {
    console.error('Error loading advice:', error);
  }
}

function getMoodEmoji(mood) {
  const emojis = {
    happy: '😊',
    neutral: '😐',
    sad: '😢',
    angry: '😠',
    excited: '🤩'
  };
  return emojis[mood] || '😐';
}

function loadGeneralAdvice() {
  const healthAdvice = [
    "Mantén una rutina de ejercicio regular",
    "Duerme al menos 7-8 horas diarias",
    "Mantén una alimentación balanceada"
  ];

  const productivityAdvice = [
    "Establece objetivos pequeños y alcanzables",
    "Toma descansos regulares durante el trabajo",
    "Prioriza tus tareas más importantes"
  ];

  const mentalAdvice = [
    "Practica la meditación o mindfulness",
    "Mantén un diario de gratitud",
    "Busca momentos de tranquilidad cada día"
  ];

  document.getElementById('health-advice').innerHTML = 
    `<ul>${healthAdvice.map(advice => `<li>${advice}</li>`).join('')}</ul>`;
  document.getElementById('productivity-advice').innerHTML = 
    `<ul>${productivityAdvice.map(advice => `<li>${advice}</li>`).join('')}</ul>`;
  document.getElementById('mental-advice').innerHTML = 
    `<ul>${mentalAdvice.map(advice => `<li>${advice}</li>`).join('')}</ul>`;
}

const adviceData = {
  happy: [
    "¡Mantén ese ánimo positivo! Comparte tu felicidad con otros",
    "Es un buen momento para establecer nuevos objetivos",
    "Aprovecha esta energía para realizar actividades que te gustan"
  ],
  neutral: [
    "Intenta hacer algo que disfrutes para mejorar tu ánimo",
    "Practica la gratitud pensando en las cosas buenas de tu día",
    "Un poco de ejercicio podría ayudarte a sentirte mejor"
  ],
  sad: [
    "Habla con alguien de confianza sobre cómo te sientes",
    "Dedica tiempo a actividades relajantes",
    "Recuerda que está bien no estar bien, pero busca ayuda si lo necesitas"
  ],
  angry: [
    "Practica ejercicios de respiración profunda",
    "Toma un momento para reflexionar antes de actuar",
    "El ejercicio físico puede ayudar a liberar tensión"
  ],
  excited: [
    "Canaliza tu energía en proyectos creativos",
    "Comparte tu entusiasmo con otros de manera positiva",
    "Aprovecha para planificar nuevas metas"
  ]
};

// Make functions available globally
window.loadAdvice = loadAdvice;