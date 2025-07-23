import { db } from "./db";
import { chapters, quizzes, quizQuestions, badges, dailyChallenges } from "@shared/schema";
import { seedAdminUser } from "./seed-admin";

export async function seedDatabase() {
  try {
    console.log("Seeding database...");

    // Sample chapters from I Promessi Sposi
    const sampleChapters = [
      {
        number: 1,
        title: "Don Abbondio e i bravi",
        content: `<p>Quel ramo del lago di Como, che volge a mezzogiorno, tra due catene non interrotte di monti, tutto a seni e a golfi, a seconda dello sporgere e del rientrare di quelli, vien, quasi a un tratto, a ristringersi, e a prender corso e figura di fiume, tra un promontorio a destra, e un'ampia costiera dall'altra parte; e il ponte, che ivi congiunge le due rive, par che renda ancor più sensibile all'occhio questa trasformazione, e segni il punto dove il lago cessa, e l'Adda rincomincia, per riprendere poi nome di lago dove le rive, allontanandosi di nuovo, lascian l'acqua distendersi e rallentarsi in nuovi golfi e in nuovi seni.</p>
        
        <p>La costiera, formata dal deposito di tre grossi torrenti, scende appoggiata a due monti contigui, l'uno detto di san Martino, l'altro, con voce lombarda, il Resegone, dai molti suoi cocuzzoli in fila, che in vero lo fanno somigliare a una sega: talchè non è chi, al primo vederlo, purché sia di fronte, come per esempio di su le mura di Milano che guardano a settentrione, non lo discerna tosto, a un tal contrassegno, in quella lunga e vasta giogaia, dagli altri monti di nome più oscuro e di forma più comune.</p>
        
        <p>Per una di queste stradicciole, tornava bel bello dalla passeggiata verso casa, sulla sera del giorno 7 novembre dell'anno 1628, don Abbondio, curato d'una delle terre accennate di sopra: il qual nome, e il cognome dell'altro personaggio che faceva la principale figura in questa storia, quando se ne sapesse qualcosa di più, ci assicurano di aver vere testimonianze.</p>`,
        summary: "Il romanzo inizia con la famosa descrizione del lago di Como e l'incontro di don Abbondio con i bravi.",
        readingTime: 15,
        imageUrl: "https://images.unsplash.com/photo-1528543606781-2f6e6857f318?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        isLocked: false
      },
      {
        number: 2,
        title: "Renzo e Lucia",
        content: `<p>Il sole non era ancora tutto apparso sull'orizzonte, quando Renzo uscì dalla sua casetta, e prese la strada che menava alla chiesa del suo paesello. Era vestito a festa, e aveva in tasca pochi giulj, frutto e premio de' risparmi, e della sobrietà di molte settimane.</p>
        
        <p>Andava a sposare Lucia, quella Lucia ch'era già da qualche tempo la sposa del suo cuore. Era stata fermata, di pieno consenso de' parenti di lei e di lui, quella mattina per le nozze; e Renzo andava, secondo il concertato, per trovarsi col curato alla chiesa, dove doveva pure, in quel momento, arrivare la sposa, accompagnata dalle donne.</p>
        
        <p>Lucia infatti s'avviava in quel momento alla chiesa, vestita pur essa a festa, e accompagnata dalla madre Agnese, da alcune vicine e parenti. Aveva in testa una bella e ricca acconciatura di capelli, con spilloni d'argento; un bel corpetto di broccato a fiori, con le maniche separate e allacciate da bei nastri; una gonnella di seta a pieghe minute, con una ricca fascia; un bel paio di calze di seta, e i pianellini, pure di seta, a ricami.</p>`,
        summary: "Renzo e Lucia si preparano per il loro matrimonio, ma un ostacolo inatteso li attende.",
        readingTime: 12,
        imageUrl: "https://images.unsplash.com/photo-1519167758481-83f29c5c6555?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        isLocked: false
      },
      {
        number: 3,
        title: "Il matrimonio impedito",
        content: `<p>Don Abbondio, che già da qualche tempo andava ogni giorno più facilmente in collera, e trovava sempre più difficile il contenersi, al vedere quella gente che veniva proprio a cercarlo per metterlo alle strette, sentì crescere la bile; ma, dovendo dissimulare, il poverino stava lì impacciato, come un ragazzo colto in fallo.</p>
        
        <p>"Come, come! cosa voglion dire queste cerimonie in casa mia?" disse, con voce alterata, guardando in viso prima l'uno, poi l'altro, con occhi che chiedevano soccorso.</p>
        
        <p>"Che cosa voglion dire?" rispose Renzo, facendosi più presso, e tenendo sempre la mano di Lucia: "voglion dire che siamo qui per fare i nostri negozi. Lei ci ha fatti posare per più di due mesi, dicendo or questo or quello; oggi non ci deve scappare; e, come le ho detto altre volte, l'abbiamo avvisata per tempo."</p>`,
        summary: "Don Abbondio rivela di non poter celebrare il matrimonio, creando confusione e disperazione negli sposi.",
        readingTime: 18,
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        isLocked: true
      }
    ];

    // Insert chapters
    for (const chapterData of sampleChapters) {
      await db.insert(chapters).values(chapterData).onConflictDoNothing();
    }

    // Sample quizzes
    const sampleQuizzes = [
      {
        chapterId: 1,
        title: "Quiz Capitolo 1 - Don Abbondio e i bravi",
        description: "Verifica la tua comprensione del primo capitolo",
        xpReward: 100
      },
      {
        chapterId: 2,
        title: "Quiz Capitolo 2 - Renzo e Lucia",
        description: "Test sulla presentazione dei protagonisti",
        xpReward: 100
      }
    ];

    // Insert quizzes
    const insertedQuizzes = [];
    for (const quizData of sampleQuizzes) {
      const [quiz] = await db.insert(quizzes).values(quizData).returning();
      insertedQuizzes.push(quiz);
    }

    // Sample quiz questions
    const sampleQuestions = [
      // Quiz 1 questions
      {
        quizId: insertedQuizzes[0].id,
        question: "Dove è ambientato l'inizio del romanzo?",
        type: "multiple_choice",
        options: ["Lago di Como", "Lago di Garda", "Lago Maggiore", "Lago d'Iseo"],
        correctAnswer: "Lago di Como",
        explanation: "Il romanzo inizia con la famosa descrizione del ramo del lago di Como.",
        points: 10,
        order: 1
      },
      {
        quizId: insertedQuizzes[0].id,
        question: "Come si chiama il monte che somiglia a una sega?",
        type: "multiple_choice",
        options: ["Monte San Martino", "Il Resegone", "Monte Barro", "Monte Grona"],
        correctAnswer: "Il Resegone",
        explanation: "Il Resegone prende il nome dai suoi cocuzzoli che lo fanno somigliare a una sega.",
        points: 10,
        order: 2
      },
      {
        quizId: insertedQuizzes[0].id,
        question: "In che data inizia la storia?",
        type: "multiple_choice",
        options: ["7 novembre 1628", "7 novembre 1630", "7 ottobre 1628", "7 dicembre 1628"],
        correctAnswer: "7 novembre 1628",
        explanation: "La storia inizia il 7 novembre 1628, quando don Abbondio incontra i bravi.",
        points: 10,
        order: 3
      },
      {
        quizId: insertedQuizzes[0].id,
        question: "Don Abbondio è il curato del paese.",
        type: "true_false",
        options: null,
        correctAnswer: "true",
        explanation: "Don Abbondio è effettivamente il curato di una delle terre lungo il lago.",
        points: 10,
        order: 4
      },
      // Quiz 2 questions
      {
        quizId: insertedQuizzes[1].id,
        question: "Come si chiama la promessa sposa di Renzo?",
        type: "multiple_choice",
        options: ["Lucia", "Agnese", "Perpetua", "Geltrude"],
        correctAnswer: "Lucia",
        explanation: "Lucia è la giovane che Renzo vuole sposare.",
        points: 10,
        order: 1
      },
      {
        quizId: insertedQuizzes[1].id,
        question: "Come si chiama la madre di Lucia?",
        type: "multiple_choice",
        options: ["Perpetua", "Agnese", "Geltrude", "Marta"],
        correctAnswer: "Agnese",
        explanation: "Agnese è la madre di Lucia che l'accompagna verso la chiesa.",
        points: 10,
        order: 2
      },
      {
        quizId: insertedQuizzes[1].id,
        question: "Renzo e Lucia erano già fidanzati.",
        type: "true_false",
        options: null,
        correctAnswer: "true",
        explanation: "Lucia era già la sposa del cuore di Renzo da qualche tempo.",
        points: 10,
        order: 3
      }
    ];

    // Insert quiz questions
    for (const questionData of sampleQuestions) {
      await db.insert(quizQuestions).values(questionData).onConflictDoNothing();
    }

    // Sample badges
    const sampleBadges = [
      {
        name: "Primo Passo",
        description: "Hai completato il primo capitolo",
        icon: "fas fa-star",
        type: "chapter",
        requirement: JSON.stringify({ chapter: 1 }),
        xpReward: 50
      },
      {
        name: "Lettore Assiduo",
        description: "Hai letto 3 capitoli consecutivi",
        icon: "fas fa-book-open",
        type: "achievement",
        requirement: JSON.stringify({ consecutive_chapters: 3 }),
        xpReward: 100
      },
      {
        name: "Quiz Master",
        description: "Hai superato 5 quiz con punteggio perfetto",
        icon: "fas fa-trophy",
        type: "quiz",
        requirement: JSON.stringify({ perfect_quizzes: 5 }),
        xpReward: 200
      },
      {
        name: "Streak di Fuoco",
        description: "Hai mantenuto una streak di 7 giorni",
        icon: "fas fa-fire",
        type: "streak",
        requirement: JSON.stringify({ streak_days: 7 }),
        xpReward: 150
      }
    ];

    // Insert badges
    for (const badgeData of sampleBadges) {
      await db.insert(badges).values(badgeData).onConflictDoNothing();
    }

    // Sample daily challenge
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sampleChallenge = {
      title: "Lettore del Giorno",
      description: "Leggi 3 capitoli oggi per completare la sfida giornaliera",
      type: "reading",
      requirement: JSON.stringify({ chapters_to_read: 3, target: 3 }),
      xpReward: 150,
      coinReward: 50,
      date: today,
      isActive: true
    };

    await db.insert(dailyChallenges).values(sampleChallenge).onConflictDoNothing();

    // Seed admin user
    await seedAdminUser();

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}