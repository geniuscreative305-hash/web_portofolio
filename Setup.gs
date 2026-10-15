/**
 * Setup.gs
 * Google Apps Script - Safe Database Setup & Migration
 * Personal Branding Portfolio: Archana (Graphic Design, Vibe Coding, Copywriting)
 */

function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log("No active spreadsheet found. Please run this script attached to a Google Sheet.");
    return { success: false, message: "No active spreadsheet found." };
  }

  // Schema definition: SheetName -> Array of required header names
  var schemas = {
    "Profile": [
      "ConfigKey", "ConfigValue"
    ],
    "Services": [
      "ServiceID", "Title", "Description", "Icon", "SortOrder"
    ],
    "Process": [
      "ProcessID", "StepNumber", "Title", "Description", "Icon"
    ],
    "Portfolio": [
      "PortfolioID", "Title", "Category", "ImageUrl", "Summary", "DetailContent", "ProjectUrl", "SortOrder"
    ],
    "Blogs": [
      "BlogID", "Title", "Category", "ImageUrl", "Excerpt", "FullContent", "DatePublished", "ReadTime"
    ],
    "Testimonials": [
      "TestimonialID", "ClientName", "ClientRole", "ClientPhoto", "Rating", "QuoteText"
    ],
    "Clients": [
      "ClientID", "ClientName", "LogoUrl", "SortOrder"
    ],
    "Messages": [
      "MessageID", "Timestamp", "SenderName", "SenderEmail", "Subject", "MessageText", "Status"
    ]
  };

  // Safe migration: loop through schemas without destructive operations
  for (var sheetName in schemas) {
    if (schemas.hasOwnProperty(sheetName)) {
      var requiredHeaders = schemas[sheetName];
      var sheet = ss.getSheetByName(sheetName);

      if (!sheet) {
        // Create new sheet if it doesn't exist
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow(requiredHeaders);
        formatHeaderRow(sheet, requiredHeaders.length);
      } else {
        // Sheet exists: perform non-destructive header check
        var lastCol = sheet.getLastColumn();
        var existingHeaders = [];
        if (lastCol > 0) {
          existingHeaders = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
        }

        // Find missing headers and append them to the right
        for (var i = 0; i < requiredHeaders.length; i++) {
          var header = requiredHeaders[i];
          if (existingHeaders.indexOf(header) === -1) {
            var newCol = sheet.getLastColumn() + 1;
            sheet.getRange(1, newCol).setValue(header);
            existingHeaders.push(header);
          }
        }
        formatHeaderRow(sheet, sheet.getLastColumn());
      }
    }
  }

  // Populate realistic initial dummy data if sheets are empty
  seedInitialDataIfEmpty(ss);

  SpreadsheetApp.flush();
  Logger.log("Database safe setup and migration completed successfully.");
  return { success: true, message: "Database safe setup and migration completed successfully." };
}

/**
 * Helper to style header row
 */
function formatHeaderRow(sheet, numColumns) {
  if (numColumns < 1) return;
  var headerRange = sheet.getRange(1, 1, 1, numColumns);
  headerRange.setBackground("#7c3aed")
             .setFontColor("#ffffff")
             .setFontWeight("bold")
             .setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
}

/**
 * Non-destructive initial dummy data seeder for Archana
 */
function seedInitialDataIfEmpty(ss) {
  // 1. Profile Sheet
  var profileSheet = ss.getSheetByName("Profile");
  if (profileSheet && profileSheet.getLastRow() <= 1) {
    var profileData = [
      ["HeroTitle", "Hello, I'm Archana"],
      ["HeroSub", "Graphic Designer, Vibe Coder & Copywriter"],
      ["BioText", "Synthesizing visual elegance, AI-driven vibe coding logic, and high-converting storytelling to build digital brands that captivate and convert."],
      ["StatYears", "5+"],
      ["StatProjects", "120+"],
      ["StatClients", "85+"],
      ["ContactEmail", "archana.creative@example.com"],
      ["ContactPhone", "+62 812 8990 4521"],
      ["ContactLocation", "Jakarta, Indonesia & Remote Worldwide"],
      ["ProfileImage", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"],
      ["AboutTitle", "Crafting Experiences Where Art, AI & Storytelling Intersect"],
      ["AboutDesc", "I combine aesthetic graphic design principles with vibe coding speed and conversion-oriented copywriting. Whether designing sleek brand visual identities, building interactive modern web interfaces with AI copilot workflows, or crafting words that evoke emotion and drive sales, I bridge the gap between creative imagination and digital execution."],
      ["AdminPIN", "archana123"]
    ];
    for (var p = 0; p < profileData.length; p++) {
      profileSheet.appendRow(profileData[p]);
    }
  }

  // 2. Services Sheet
  var servicesSheet = ss.getSheetByName("Services");
  if (servicesSheet && servicesSheet.getLastRow() <= 1) {
    var servicesData = [
      [
        "SRV-001",
        "Brand Identity & Graphic Design",
        "Comprehensive visual identity systems, bespoke logo design, brand guidelines, typography curation, and high-impact marketing collateral.",
        "palette",
        1
      ],
      [
        "SRV-002",
        "Interactive Vibe Coding Web Apps",
        "Rapid prototyping and full-stack interactive micro-apps powered by modern AI-assisted vibe coding workflows, tailored design, and dynamic interfaces.",
        "code",
        2
      ],
      [
        "SRV-003",
        "High-Converting Copywriting",
        "Strategic narrative architecture, landing page copy, email sequences, and brand voice guidelines calibrated for maximum customer conversion.",
        "feather",
        3
      ]
    ];
    for (var s = 0; s < servicesData.length; s++) {
      servicesSheet.appendRow(servicesData[s]);
    }
  }

  // 3. Process Sheet
  var processSheet = ss.getSheetByName("Process");
  if (processSheet && processSheet.getLastRow() <= 1) {
    var processData = [
      [
        "PRC-001",
        1,
        "Research & Strategy",
        "Deep discovery into target audience psychology, brand positioning, competitor matrix, and technical requirements.",
        "compass"
      ],
      [
        "PRC-002",
        2,
        "Concept & Vibe Coding",
        "Exploration of interactive prototypes, AI-augmented code architecture, and structured layout blueprints.",
        "cpu"
      ],
      [
        "PRC-003",
        3,
        "Visual & Copy Crafting",
        "Polishing high-fidelity aesthetic components, color harmony, responsive design, and persuasive sales narrative.",
        "pen-tool"
      ],
      [
        "PRC-004",
        4,
        "Final Launch & Handover",
        "Cross-device QA testing, performance optimization, client walkthrough, and deployment ready for exponential growth.",
        "rocket"
      ]
    ];
    for (var pr = 0; pr < processData.length; pr++) {
      processSheet.appendRow(processData[pr]);
    }
  }

  // 4. Portfolio Sheet
  var portfolioSheet = ss.getSheetByName("Portfolio");
  if (portfolioSheet && portfolioSheet.getLastRow() <= 1) {
    var portfolioData = [
      [
        "PORT-001",
        "Aura Living - Minimalist Brand Identity",
        "Graphic Design",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        "Full brand identity guidelines, sustainable packaging, and visual design for a luxury homeware brand.",
        "A comprehensive visual branding project for Aura Living, featuring a custom wordmark, earthen color palette, bespoke icon set, and luxury packaging designs crafted in Illustrator and Figma.",
        "https://behance.net",
        1
      ],
      [
        "PORT-002",
        "PulseVibe - AI Prompt-to-UI Studio",
        "Vibe Coding",
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
        "Interactive web application that translates natural language UI specs into responsive frontend components.",
        "PulseVibe was built using modern Vibe Coding techniques with instant reactive state, component export, and clean Vanilla CSS architecture for lightning-fast prototyping.",
        "https://github.com",
        2
      ],
      [
        "PORT-003",
        "Lumina SaaS - High-Converting Sales Page",
        "Copywriting",
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80",
        "Conversion-focused landing page copy and customer onboarding flow that boosted trial conversions by 42%.",
        "Researched customer friction points and synthesized a 5-part storytelling framework emphasizing product benefits over raw features, resulting in an immediate 42% lift in free-to-paid conversion.",
        "https://example.com",
        3
      ],
      [
        "PORT-004",
        "Solstice Kinetic - 3D Visual Poster Series",
        "Graphic Design",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        "Exploration of chromatic aberrations, Swiss typographic hierarchy, and geometric layout compositions.",
        "An experimental typography and visual design series exploring kinetic typography, vibrant gradient mesh transitions, and print-ready editorial compositions.",
        "https://dribbble.com",
        4
      ],
      [
        "PORT-005",
        "Zenith Finance - Interactive Wealth Dashboard",
        "Vibe Coding",
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
        "Responsive financial tracking web application with dynamic chart rendering, smart budgeting, and dark mode.",
        "Developed end-to-end within 48 hours using AI-assisted vibe coding routines, optimized data filtering, lightweight charts, and zero dependency overhead.",
        "https://zenith-finance.demo",
        5
      ],
      [
        "PORT-006",
        "Koa Botanicals - E-Commerce Copy & Brand Voice",
        "Copywriting",
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
        "Holistic tone-of-voice guidebook, product descriptions, and nurture email drip series for organic skincare.",
        "Established an organic, conversational, yet authoritative brand voice for Koa Botanicals that generated an 68% open rate and sustained customer loyalty across multiple product drops.",
        "https://koabotanicals.demo",
        6
      ]
    ];
    for (var pf = 0; pf < portfolioData.length; pf++) {
      portfolioSheet.appendRow(portfolioData[pf]);
    }
  }

  // 5. Blogs Sheet
  var blogsSheet = ss.getSheetByName("Blogs");
  if (blogsSheet && blogsSheet.getLastRow() <= 1) {
    var blogsData = [
      [
        "BLG-001",
        "The Symbiosis of Graphic Design and Vibe Coding",
        "Vibe Coding",
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
        "How pairing rapid AI coding assistants with solid visual aesthetics creates 10x faster shipping cycles.",
        "In the traditional product development cycle, designers and developers often encounter friction in handoffs. Vibe Coding dissolves this boundary: when a designer who understands grid systems, typography, and contrast codes with AI assistance, the output is not just functional, but visually mesmerizing and delightful to use.",
        "2026-10-10",
        "4 min read"
      ],
      [
        "BLG-002",
        "Crafting Words That Sell: The 4P Copywriting Formula",
        "Copywriting",
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
        "Picture, Promise, Prove, Push — a proven psychological blueprint to transform curious readers into buyers.",
        "Good design grabs attention, but persuasive copy seals the deal. The 4P framework begins with painting a vivid picture of the user's aspirational reality, establishing an unshakeable promise, proving credibility with data, and delivering an irresistible push to take action right now.",
        "2026-10-05",
        "5 min read"
      ],
      [
        "BLG-003",
        "Color Psychology & Micro-Interactions in Modern UI",
        "Graphic Design",
        "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80",
        "Why subtle violet gradients and snappy physics-based hover states create an unforgettable digital impression.",
        "Color evokes primal neurological responses. Soft purples and violets balance technological wisdom with creative luxury. Combining curated violet hues with micro-transitions (subtle lifts, glowing focus rings) elevates an ordinary web app to an emotional digital experience.",
        "2026-09-28",
        "6 min read"
      ]
    ];
    for (var b = 0; b < blogsData.length; b++) {
      blogsSheet.appendRow(blogsData[b]);
    }
  }

  // 6. Testimonials Sheet
  var testimonialsSheet = ss.getSheetByName("Testimonials");
  if (testimonialsSheet && testimonialsSheet.getLastRow() <= 1) {
    var testimonialsData = [
      [
        "TST-001",
        "Marcus Sterling",
        "Founder & CEO at Lumina Studio",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
        "5",
        "Archana's rare combination of razor-sharp aesthetic sense and vibe coding capabilities blew our team away. She built our interactive web portal in days with a level of design polish usually found in top Silicon Valley agencies."
      ],
      [
        "TST-002",
        "Elena Rostova",
        "Head of Brand at Velvet Bloom",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
        "5",
        "The copy Archana wrote for our product launch converted 40% higher than our previous agency's work. She truly understands human psychology and how to craft stories that resonate deeply."
      ],
      [
        "TST-003",
        "Darian Vance",
        "Product Lead at NexaFlow",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
        "5",
        "Archana delivers exceptional results on every front. From our logo refresh to our interactive dashboard prototype, she executes with velocity, poise, and meticulous attention to detail."
      ]
    ];
    for (var t = 0; t < testimonialsData.length; t++) {
      testimonialsSheet.appendRow(testimonialsData[t]);
    }
  }

  // 7. Clients Sheet
  var clientsSheet = ss.getSheetByName("Clients");
  if (clientsSheet && clientsSheet.getLastRow() <= 1) {
    var clientsData = [
      ["CLI-001", "Spotify", "https://cdn.simpleicons.org/spotify/7c3aed", 1],
      ["CLI-002", "Slack", "https://cdn.simpleicons.org/slack/7c3aed", 2],
      ["CLI-003", "Linear", "https://cdn.simpleicons.org/linear/7c3aed", 3],
      ["CLI-004", "Figma", "https://cdn.simpleicons.org/figma/7c3aed", 4],
      ["CLI-005", "Notion", "https://cdn.simpleicons.org/notion/7c3aed", 5],
      ["CLI-006", "Stripe", "https://cdn.simpleicons.org/stripe/7c3aed", 6]
    ];
    for (var c = 0; c < clientsData.length; c++) {
      clientsSheet.appendRow(clientsData[c]);
    }
  }

  // 8. Messages Sheet (dummy message to demonstrate format)
  var messagesSheet = ss.getSheetByName("Messages");
  if (messagesSheet && messagesSheet.getLastRow() <= 1) {
    var todayFormatted = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+7", "yyyyMMdd");
    var initialMessage = [
      "MSG-" + todayFormatted + "-0001",
      Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+7", "yyyy-MM-dd HH:mm:ss"),
      "Claire Dupont",
      "claire@dupontmedia.com",
      "Rebranding & Interactive Web App Project",
      "Hi Archana, we love your design portfolio and vibe coding work. We'd love to discuss our upcoming product launch next month!",
      "New"
    ];
    messagesSheet.appendRow(initialMessage);
  }
}
