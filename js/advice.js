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
      const moodAdvice = adviceData[lastMood] || adviceData.unknown || adviceData.neutral;
      
      document.getElementById('mood-advice-content').innerHTML = `
        <div class="advice-card">
          <p class="current-mood">Tu estado actual: ${getMoodEmoji(lastMood)}</p>
          <ul>
            ${moodAdvice.map(advice => `<li>${advice}</li>`).join('')}
          </ul>
        </div>
      `;
    } else {
      showError('No se pudo encontrar tu último estado de ánimo.');
    }

    // Cargar consejos generales
    loadGeneralAdvice(lastMood);
  } catch (error) {
    console.error('Error loading advice:', error);
    showError('No se pudo cargar el consejo, por favor intenta nuevamente más tarde.');
  }
}

function showError(message) {
  document.getElementById('mood-advice-content').innerHTML = `
    <p class="error-message">${message}</p>
  `;
}

function getMoodEmoji(mood) {
  const emojis = {
    happy: '😊',
    neutral: '😐',
    sad: '😢',
    angry: '😠',
    excited: '🤩',
    unknown: '❓'
  };
  return emojis[mood] || emojis.unknown;
}

function loadGeneralAdvice(mood) {
  // Consejos de salud, ajustados según el estado de ánimo
  const healthAdvice = mood === 'sad' ? [
    "Intenta salir a caminar para despejar tu mente",
    "Hablar con alguien puede ser muy útil"
  ] : [
    "Mantén una rutina de ejercicio regular",
    "Duerme al menos 7-8 horas diarias",
    "Mantén una alimentación balanceada"
  ];

  // Consejos de productividad, ajustados según el estado de ánimo
  const productivityAdvice = mood === 'excited' ? [
    "Canaliza tu energía en proyectos creativos",
    "Planifica tus objetivos con entusiasmo"
  ] : [
    "Establece objetivos pequeños y alcanzables",
    "Toma descansos regulares durante el trabajo",
    "Prioriza tus tareas más importantes"
  ];

  // Consejos mentales, ajustados según el estado de ánimo
  const mentalAdvice = mood === 'angry' ? [
    "Practica ejercicios de respiración profunda",
    "Toma un momento para reflexionar antes de actuar",
    "El ejercicio físico puede ayudar a liberar tensión"
  ] : [
    "Practica la meditación o mindfulness",
    "Mantén un diario de gratitud",
    "Busca momentos de tranquilidad cada día"
  ];

  // Actualizar los consejos en la UI con las clases de CSS para estilo
  document.getElementById('health-advice').innerHTML = 
    `<div class="advice-card"><ul>${healthAdvice.map(advice => `<li>${advice}</li>`).join('')}</ul></div>`;
  document.getElementById('productivity-advice').innerHTML = 
    `<div class="advice-card"><ul>${productivityAdvice.map(advice => `<li>${advice}</li>`).join('')}</ul></div>`;
  document.getElementById('mental-advice').innerHTML = 
    `<div class="advice-card"><ul>${mentalAdvice.map(advice => `<li>${advice}</li>`).join('')}</ul></div>`;
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
  ],
  unknown: [
    "Parece que no tenemos un estado de ánimo definido para ti, pero recuerda cuidar de ti mismo.",
    "No te preocupes, todos tenemos altibajos, ¡aquí estamos para apoyarte!",
    "Intenta reflexionar sobre cómo te sientes y tal vez practicar un poco de mindfulness."
  ]
};

// Make functions available globally
window.loadAdvice = loadAdvice;
