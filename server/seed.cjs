const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const originalQuestions = [
    { text: "¿Cuántos empleados tiene tu empresa?", type: "choice", options: ["< 100", "100-500", "501-1000", "1001-5000", "5001-10000", ">10000"], category: "General" },
    { text: "¿Qué canal prefieres para un primer contacto comercial?", type: "choice", options: ["Email", "LinkedIn", "Llamada directa", "WhatsApp / mensaje escrito"], category: "Preferencias" },
    { text: "¿Qué tipo de llamada aceptarías de un vendedor?", type: "choice", options: ["Totalmente en frío, sin conocerlo", "Si antes me ha escrito por email o LinkedIn", "Solo si me lo ha referido un contacto en común", "No acepto llamadas de vendedores"], category: "Llamadas" },
    { text: "¿Qué duración máxima consideras aceptable para una primera llamada comercial?", type: "choice", options: ["Menos de 3 minutos", "Entre 3 y 5 minutos", "Entre 5 y 10 minutos", "Me da igual, si es relevante"], category: "Llamadas" },
    { text: "¿En qué franja horaria preferirías recibir una llamada comercial?", type: "choice", options: ["A primera hora de la mañana (8:00 - 10:00)", "Antes del mediodía (10:00 - 13:00)", "Por la tarde (15:00 - 18:00)", "No tengo preferencia / Me da igual"], category: "Llamadas" },
    { text: "¿Cómo prefieres que empiece la conversación el comercial?", type: "choice", options: ["Que vaya directo al grano y explique qué hace su producto o solución", "Que mencione un problema común en tu sector y cómo lo han resuelto otros clientes similares", "Que comente algo reciente o relevante sobre tu empresa (una noticia, cambio, crecimiento...)", "Que conecte lo que ofrece con un reto típico que puede tener alguien en tu puesto"], category: "Llamadas" },
    { text: "Cuando expresas una objeción como 'ya tenemos una solución interna', 'no es una prioridad ahora' o 'ya trabajamos con un proveedor', ¿cómo prefieres que reaccione el comercial?", type: "choice", options: ["Que agradezca el tiempo y no vuelva a contactarme", "Que haga un último intento, con un argumento relevante y personalizado", "Que me pregunte si puede volver a contactarme más adelante (1–6 meses)", "Que me envíe información por email para revisarla cuando tenga tiempo", "Otro"], category: "Llamadas" },
    { text: "¿Qué es lo primero que te hace abrir un email comercial?", type: "choice", options: ["El asunto", "El remitente (cargo / empresa)", "Que mencione mi empresa o rol", "Que sea muy corto", "Casi nunca abro emails comerciales"], category: "Correos" },
    { text: "¿Qué tipo de ASUNTO te genera más interés?", type: "choice", options: ["Una pregunta directa", "Un problema común de mi sector", "Un beneficio concreto (ahorro, tiempo, riesgo)", "Algo personalizado sobre mi empresa", "Ninguno, casi siempre los ignoro"], category: "Correos" },
    { text: "¿Qué longitud consideras ideal para un primer email comercial?", type: "choice", options: ["3–4 líneas", "5–7 líneas", "8–12 líneas", "No me importa si va al grano"], category: "Correos" },
    { text: "¿Qué tono prefieres en un primer email?", type: "choice", options: ["Muy directo y profesional", "Cercano pero respetuoso", "Consultivo (más preguntas que discurso)", "Formal y serio", "Me da igual el tono, importa el contenido"], category: "Correos" },
    { text: "¿Qué te molesta MÁS en un email comercial?", type: "choice", options: ["Que sea genérico", "Que sea demasiado largo", "Que hable solo del producto", "Que intente vender demasiado rápido", "Que insista sin haber respondido"], category: "Correos" },
    { text: "¿Cuántos emails de seguimiento consideras razonables si no respondes?", type: "choice", options: ["Ninguno", "1", "2–3", "Más de 3 si aportan valor"], category: "Correos" },
    { text: "Si no respondes a un email, normalmente es porque…", type: "choice", options: ["No me interesa", "No tengo tiempo", "Lo vi pero lo olvidé", "No estaba bien enfocado para mí", "Prefiero otro canal"], category: "Correos" },
    { text: "¿Aceptas una solicitud de conexión de alguien que no conoces?", type: "choice", options: ["Sí, si me envía también un mensaje breve de presentación", "Sí, aunque no me diga nada, solo con la solicitud", "No, no acepto solicitudes de personas que no conozco"], category: "LinkedIn" },
    { text: "¿Qué te anima a aceptar un InMail o mensaje por LinkedIn de alguien que no conoces?", type: "choice", options: ["Que el mensaje esté personalizado con algo relacionado a mi empresa/algo que he compartido", "Que tengamos contactos en común", "Que mencione un tema de interés para mí", "Nada, solo acepto si conozco a la persona", "Otro"], category: "LinkedIn" },
    { text: "¿Qué tipo de contenido prefieres recibir en un primer InMail o mensaje por LinkedIn?", type: "choice", options: ["Que diga claramente por qué me contacta y qué quiere", "Que me explique con claridad qué hace su herramienta y por qué puede ser relevante para mí", "Que mencione un problema real que podría tener en mi día a día y cómo lo han resuelto otros clientes", "Que me comente los problemas más comunes en mi sector y cómo otras empresas similares los han solucionado con su herramienta", "Otro"], category: "LinkedIn" },
    { text: "¿Qué extensión consideras ideal para un primer InMail o mensaje por LinkedIn?", type: "choice", options: ["3-4 líneas: lo más corto posible, solo para captar mi atención", "4-6 líneas: breve pero con contexto suficiente", "7-10 líneas: si está bien escrito, no me importa que sea más largo", "No me importa la longitud si el contenido es interesante"], category: "LinkedIn" },
    { text: "¿Cuántos InMails o mensajes de seguimiento consideras razonables en LinkedIn antes de que sea molesto?", type: "choice", options: ["Solo uno (máximo)", "Dos o Tres", "Más de tres si hay valor en lo que me dice", "Ninguno, si no respondo es porque no me interesa"], category: "LinkedIn" },
    { text: "¿Qué tipo de contenido prefieres recibir en un correo o un mensaje en LinkedIn?", type: "choice", options: ["Un caso de uso de una empresa similar a la mía", "Un vídeo corto explicativo", "Una presentación PDF con los puntos clave de la solución", "Una demo grabada o interactiva", "Otro"], category: "Material" },
    { text: "¿Te interesa conocer resultados concretos (ahorro, eficiencia, ROI) en el material que recibes?", type: "choice", options: ["Sí, es lo primero que miro", "Solo si están bien justificados", "No, me interesa más la parte funcional", "No me importa"], category: "Material" },
    { text: "¿Te interesa conocer cómo otras empresas solucionaron problemas similares al tuyo?", type: "choice", options: ["Sí, especialmente si son de mi sector", "Sí, aunque no sean del mismo sector", "No es algo que me influya mucho", "No me interesa"], category: "Material" },
    { text: "¿Te interesa que el material incluya información técnica detallada?", type: "choice", options: ["Sí, cuanto más detallada mejor", "Sí, pero solo lo básico", "Prefiero una visión general sin detalles técnicos", "No me interesa la parte técnica"], category: "Material" },
    { text: "¿Qué duración consideras ideal para un vídeo explicativo o de presentación?", type: "choice", options: ["Menos de 1 minuto", "Entre 1 y 3 minutos", "Entre 3 y 5 minutos", "Más de 5 minutos si el contenido lo merece", "No me importa la duración si el vídeo es interesante"], category: "Material" },
    { text: "¿Qué longitud consideras adecuada para un documento PDF o presentación comercial?", type: "choice", options: ["1-2 páginas máximo", "3-4 páginas (resumen + ejemplos)", "5-7 páginas si tiene contenido útil", "No me importa si está bien estructurado"], category: "Material" },
    { text: "¿Cómo prefieres recibir el material informativo?", type: "choice", options: ["Por email en un enlace", "Por email como archivo adjunto", "Por mensaje en LinkedIn", "En una plataforma interactiva", "Otro"], category: "Material" },
    { text: "¿Prefieres recibir el material informativo ya en el primer correo o mensaje en LinkedIn, o en un seguimiento posterior?", type: "choice", options: ["En el primer mensaje, así decido si me interesa", "En un follow-up, si he mostrado algo de interés", "Depende del contenido y cómo está escrito", "Me da igual", "Otro"], category: "Material" }
];

db.serialize(() => {
    // 1. Insert Surveys
    const surveyStmt = db.prepare("INSERT INTO surveys (title, description) VALUES (?, ?)");
    surveyStmt.run("Prospecta con Éxito - Original", "Encuesta sobre preferencias de contacto.");
    surveyStmt.run("Encuesta de Prueba 2026", "Una segunda encuesta de ejemplo para probar el sistema.");
    surveyStmt.finalize();

    // 2. Insert Questions for Survey 1
    const qStmt = db.prepare("INSERT INTO questions (survey_id, text, type, options, category, order_num) VALUES (?, ?, ?, ?, ?, ?)");

    originalQuestions.forEach((q, index) => {
        qStmt.run(1, q.text, q.type, JSON.stringify(q.options), q.category, index + 1);
    });

    // Example questions for Survey 2
    qStmt.run(2, "Pregunta de muestra encuesta 2?", "choice", JSON.stringify(["Opción A", "Opción B"]), "General", 1);

    qStmt.finalize();

    // 3. Insert specific roles
    const roleStmt = db.prepare("INSERT INTO roles (name) VALUES (?)");
    ["CISO", "Marketing Director", "RRHH", "Procurement"].forEach(r => roleStmt.run(r));
    roleStmt.finalize();

    console.log("Database seeded with Surveys, Questions, and Roles.");
});

db.close();
