import { NewsItem, GameState } from '../types';

export interface StoryArcStep {
  he: {
    headline: string;
    source: string;
  };
  en: {
    headline: string;
    source: string;
  };
  category: 'politics' | 'celebs' | 'military' | 'rabbis';
}

export interface StoryArc {
  id: string;
  steps: StoryArcStep[];
}

export const STORY_ARCS: StoryArc[] = [
  // 1. Netanyahu & Ben-Gvir: "He won't be in my government" -> Minister of Internal Security
  {
    id: 'bibi_and_bengvir',
    steps: [
      {
        he: {
          headline: 'נתניהו בראיון תקיף לפני הבחירות: "בן גביר לא יהיה שר בממשלתי, הוא לא כשיר לשבת בקבינט ולא יוביל שום משרד".',
          source: 'אולפן שישי עם דני קושמרו',
        },
        en: {
          headline: 'Netanyahu in pre-election interview: "Ben-Gvir will never be a minister in my government, he is unfit for the cabinet".',
          source: 'Friday Studio',
        },
        category: 'politics',
      },
      {
        he: {
          headline: 'חודשיים לאחר הבחירות: נתניהו חותם על הסכם קואליציוני המעניק לבן גביר את תיק ביטחון הפנים וסמכויות מורחבות במאחזים.',
          source: 'מצודת זאב',
        },
        en: {
          headline: 'Two months post-election: Netanyahu signs coalition deal granting Ben-Gvir Internal Security portfolio and outpost powers.',
          source: 'Likud HQ',
        },
        category: 'politics',
      },
      {
        he: {
          headline: 'בן גביר מאיים לפרק את הממשלה: "או שמעבירים עוד 4 גדודים מהגבול למאחזים, או שאין תקציב"; נתניהו בלשכה: "הוא שותף ערכי ומסור".',
          source: 'חדשות 12 / דפנה ליאל',
        },
        en: {
          headline: 'Ben-Gvir threatens to dissolve coalition: "Move 4 more border battalions to outposts or no budget"; Netanyahu: "He is a valued partner".',
          source: 'Channel 12',
        },
        category: 'politics',
      },
      {
        he: {
          headline: 'נתניהו במסיבת עיתונאים לילית: "אני אוחז בהגה בשתי ידיים. השר בן גביר פשוט... יושב לידי ולוחץ על הגז".',
          source: 'לשכת ראש הממשלה',
        },
        en: {
          headline: 'Netanyahu at late-night press conference: "I hold the wheel with both hands. Minister Ben-Gvir is merely... pressing the gas pedal".',
          source: 'PMO Briefing',
        },
        category: 'politics',
      },
    ],
  },

  // 2. Netanyahu & Tally Gotliv: Backchannel chaos & megaphones
  {
    id: 'bibi_and_gotliv',
    steps: [
      {
        he: {
          headline: 'נתניהו בישיבת סיעת הליכוד פונה לח״כ טלי גוטליב: "טלי, אני מבקש בכל לשון של בקשה – פחות ציוצים תוקפניים, לשמור על שקט תעשייתי".',
          source: 'חדשות 13',
        },
        en: {
          headline: 'Netanyahu at Likud faction meeting to MK Tally Gotliv: "Tally, I implore you – fewer aggressive tweets, maintain coalition quiet".',
          source: 'Channel 13',
        },
        category: 'politics',
      },
      {
        he: {
          headline: 'עשר דקות לאחר ישיבת הסיעה: טלי גוטליב בציוץ של 800 מילים: "ראש הממשלה מוקף ביועצים תבוסתנים! לא ישתיקו את האמת הצרופה שלי!".',
          source: 'טוויטר / X',
        },
        en: {
          headline: 'Ten minutes later: Tally Gotliv tweets an 800-word manifesto: "The Prime Minister is surrounded by defeatist deep-state advisors!".',
          source: 'Twitter / X',
        },
        category: 'politics',
      },
      {
        he: {
          headline: 'נתניהו נצפה במסדרונות הכנסת מבצע תמרון התחמקות ונכנס לחדר שירות כשטלי גוטליב נכנסה למסדרון עם רמקול.',
          source: 'ערוץ הכנסת',
        },
        en: {
          headline: 'Netanyahu seen executing evasive maneuver in Knesset hallways, slipping into supply closet as Tally Gotliv approached with a megaphone.',
          source: 'Knesset TV',
        },
        category: 'politics',
      },
      {
        he: {
          headline: 'נתניהו בראיון לתקשורת האמריקאית: "Tally Gotliv? A very colorful colleague. In Israel, free speech is truly loud and unlimited".',
          source: 'Fox News',
        },
        en: {
          headline: 'Netanyahu to American media: "Tally Gotliv? A very colorful colleague. In Israel, free speech is truly loud and unlimited".',
          source: 'Fox News',
        },
        category: 'politics',
      },
    ],
  },

  // 3. Netanyahu & The Red Marker / Absolute Victory
  {
    id: 'bibi_red_marker',
    steps: [
      {
        he: {
          headline: 'נתניהו נואם באו״ם עם בריסטול וטוש אדום זוהר: "הנה המפה של המאחזים, שרטטתי פה קו אדום שאיש בעולם לא יעז לחצות".',
          source: 'עצרת האו״ם ניו יורק',
        },
        en: {
          headline: 'Netanyahu addresses UN with poster board and red highlighter: "Here is the outpost map, I drew a red line that nobody dares cross".',
          source: 'UN General Assembly',
        },
        category: 'politics',
      },
      {
        he: {
          headline: 'דרמה במשלחת הישראלית במנהטן: הטוש האדום הזוהר היה לא מחיק והכתים את חפת חולצתו הלבנה של נתניהו.',
          source: 'חדשות החוץ',
        },
        en: {
          headline: 'Drama in Israeli UN delegation: The neon red marker was indelible and stained Netanyahu\'s custom white shirt cuff.',
          source: 'Foreign Desk',
        },
        category: 'politics',
      },
      {
        he: {
          headline: 'נתניהו מול מצלמות הטיקטוק בבלפור: "שואלים אותי מה עם המאחזים והגבול? לא היה כלום, לא שמעתי, ולא משכו בדש מעילי".',
          source: 'טיקטוק רשמי',
        },
        en: {
          headline: 'Netanyahu on TikTok from Balfour: "They ask about the outposts and border? There was nothing, I heard nothing, nobody pulled my lapel".',
          source: 'Official TikTok',
        },
        category: 'politics',
      },
      {
        he: {
          headline: 'מזכירות הממשלה מאשרת: הוקצב סעיף מיוחד של 12,000₪ לסט טושים עמידים במים למסיבת העיתונאים של הניצחון המוחלט.',
          source: 'דה מרקר',
        },
        en: {
          headline: 'Cabinet secretariat confirms: Special ₪12,000 budget line approved for waterproof markers for the Absolute Victory presser.',
          source: 'TheMarker',
        },
        category: 'politics',
      },
    ],
  },

  // 4. Noa Kirel & Daniel Peretz wedding -> couscous
  {
    id: 'noa_and_daniel',
    steps: [
      {
        he: {
          headline: 'הזמרת נועה קירל ושוער באיירן מינכן, דניאל פרץ, מתחתנים באולם יוקרתי בשרון.',
          source: 'גיא פינס / סלבס',
        },
        en: {
          headline: 'Pop superstar Noa Kirel & Bayern Munich goalie Daniel Peretz announce wedding in Sharon.',
          source: 'Celeb News',
        },
        category: 'celebs',
      },
      {
        he: {
          headline: 'הזוג נועה קירל ודניאל פרץ בסטורי לאינסטגרם מכינים קוסקוס ביתי במטבח במינכן.',
          source: 'אינסטגרם לייב',
        },
        en: {
          headline: 'Noa Kirel & Daniel Peretz post Instagram story making homemade couscous in Munich.',
          source: 'Instagram Live',
        },
        category: 'celebs',
      },
      {
        he: {
          headline: 'דניאל פרץ מגרמניה: "הקוסקוס של נועה נדיר, אבל היא עדיין שואלת למה השוער לא עולה לנגוח בקרן".',
          source: 'ספורט 5',
        },
        en: {
          headline: 'Daniel Peretz from Germany: "Noa\'s couscous is elite, but she asks why I don\'t head the ball on corners".',
          source: 'Sport 5',
        },
        category: 'celebs',
      },
      {
        he: {
          headline: 'נועה קירל בתגובה לעקיצה: "אם דניאל ימשיך להעיר על הקוסקוס, אני שרה לו יוניקורן באוזנייה במשחק הבא".',
          source: 'ערב טוב עם גיא פינס',
        },
        en: {
          headline: 'Noa Kirel fires back: "If Daniel comments again on the couscous, I\'ll blast Unicorn in his earpiece next match".',
          source: 'Evening Star',
        },
        category: 'celebs',
      },
    ],
  },

  // 2. Ben Gvir Keychains & Border Protection
  {
    id: 'ben_gvir_keychains',
    steps: [
      {
        he: {
          headline: 'בן גביר ביקר בבית ספר בשדרות וחילק מחזיקי מפתחות עם תמונתו.',
          source: 'לשכת השר',
        },
        en: {
          headline: 'Minister Ben-Gvir visits elementary school in Sderot, hands out keychains with his portrait.',
          source: 'Minister Office',
        },
        category: 'politics',
      },
      {
        he: {
          headline: 'הורים בשדרות זועמים: "הילד קיבל מחזיק מפתחות של בן גביר ומסרב להכין שיעורי בית באזרחות".',
          source: 'חדשות 12',
        },
        en: {
          headline: 'Furious parents in Sderot: "Child got a Ben-Gvir keychain and now refuses civics homework".',
          source: 'Channel 12 News',
        },
        category: 'politics',
      },
      {
        he: {
          headline: 'בן גביר משיב לביקורת: "חילקתי גם שוקולדים, למה בתקשורת השמאלנית לא מדווחים על המתיקות?".',
          source: 'ערוץ 14 / הפטריוטים',
        },
        en: {
          headline: 'Ben-Gvir fires back: "I gave chocolates too! Why doesn\'t the left-wing media report on the sweetness?".',
          source: 'Channel 14 Patriots',
        },
        category: 'politics',
      },
      {
        he: {
          headline: 'בשל מחסור בלוחמים, במשרד לביטחון לאומי שוקלים לתלות מחזיקי מפתחות של השר לאורך הגבול להרתעה.',
          source: 'מבזקי קבינט',
        },
        en: {
          headline: 'Due to troop shortages, Ministry considers hanging Ben-Gvir keychains on border fence as deterrence.',
          source: 'Cabinet Flash',
        },
        category: 'politics',
      },
    ],
  },

  // 3. Yair Golan Quotes & Border Realism
  {
    id: 'yair_golan_quotes',
    steps: [
      {
        he: {
          headline: 'יאיר גולן: "מדינה לא הורגת תינוקות כתחביב, הממשלה הזו מנותקת לחלוטין מהמציאות הביטחונית".',
          source: 'פגוש את העיתונות',
        },
        en: {
          headline: 'Yair Golan: "A state does not kill babies as a hobby, this government is completely detached".',
          source: 'Meet the Press',
        },
        category: 'politics',
      },
      {
        he: {
          headline: 'סערה בקואליציה בעקבות דברי יאיר גולן: שרים דורשים לשלול את דרגותיו בצה״ל.',
          source: 'מבזק פוליטי',
        },
        en: {
          headline: 'Coalition storm after Yair Golan remarks: Ministers demand stripping his military rank.',
          source: 'Political Flash',
        },
        category: 'politics',
      },
      {
        he: {
          headline: 'גולן בסיור בעוטף: "במקום לצייץ גינויים במזגן, בואו תראו איך הפקרתם את הגבול לטובת מאחזים".',
          source: 'סיעת הדמוקרטים',
        },
        en: {
          headline: 'Golan on border tour: "Instead of air-conditioned tweets, come see how you abandoned the border for outposts".',
          source: 'Democrats Faction',
        },
        category: 'politics',
      },
    ],
  },

  // 4. Smotrich Economic Miracles & Faith Deficit
  {
    id: 'smotrich_miracles',
    steps: [
      {
        he: {
          headline: 'סמוטריץ\': "הגרעון הוא נס גלוי, צה״ל צריך רק אמונה ועוד שני מאחזים בבנימין".',
          source: 'ועדת הכספים',
        },
        en: {
          headline: 'Smotrich: "The deficit is a divine miracle, the army just needs faith and two more outposts".',
          source: 'Finance Committee',
        },
        category: 'politics',
      },
      {
        he: {
          headline: 'פקידי האוצר במסמך אזהרה דחוף: "הקופה מתרוקנת, חסרים תקציבים לקסדות ושכפ״צים ללוחמים".',
          source: 'כלכליסט',
        },
        en: {
          headline: 'Treasury officials issue emergency warning: "Vaults empty, no budget left for helmets and vests".',
          source: 'Calcalist',
        },
        category: 'politics',
      },
      {
        he: {
          headline: 'סמוטריץ\' משיב לפקידים: "תקראו תהילים, הכלכלה היהודית עובדת על חוקי שמיים ולא על אקסלים".',
          source: 'גלובס',
        },
        en: {
          headline: 'Smotrich fires back: "Read Psalms, Jewish economics operate on celestial laws, not Excel sheets".',
          source: 'Globes',
        },
        category: 'politics',
      },
    ],
  },

  // 5. Miri Regev Ribbon Cutting without Roads
  {
    id: 'miri_regev_ribbon',
    steps: [
      {
        he: {
          headline: 'מירי רגב גזרה סרט למחלף חדש ללא כביש גישה: "תשאלו את השקופים בדרום!".',
          source: 'משרד התחבורה',
        },
        en: {
          headline: 'Miri Regev cuts ribbon on new highway interchange with no access road: "Ask the forgotten South!".',
          source: 'Transport Ministry',
        },
        category: 'politics',
      },
      {
        he: {
          headline: 'מאות נהגים נצורים על המחלף החדש של רגב: "אין פה עלייה ולא ירידה, אנחנו ישנים ברכבים".',
          source: 'גלגלצ דיווחי תנועה',
        },
        en: {
          headline: 'Hundreds trapped on Regev\'s new interchange: "No ramp up or down, we are sleeping in our cars".',
          source: 'Galgalatz Traffic',
        },
        category: 'politics',
      },
      {
        he: {
          headline: 'רגב במסיבת עיתונאים: "היהלומים של הליכוד לא צריכים כביש סלול, אנחנו נוסעים על מסלול הניצחון".',
          source: 'ערוץ 13',
        },
        en: {
          headline: 'Regev at press conference: "Likud\'s diamonds do not need paved roads, we drive on the highway of victory".',
          source: 'Channel 13',
        },
        category: 'politics',
      },
    ],
  },

  // 6. Rabbis and Mystical Border Miracle
  {
    id: 'rabbis_kabbalah',
    steps: [
      {
        he: {
          headline: 'הרב הראשי: "בזכות הדלקת נרות בבסיסים והפרשת חלה במאחזים, נמנע אסון כבד".',
          source: 'קול ברמה',
        },
        en: {
          headline: 'Chief Rabbi: "Candle lighting on bases and challah separation at outposts averted major disaster".',
          source: 'Kol BaRama',
        },
        category: 'rabbis',
      },
      {
        he: {
          headline: 'קבוצת מקובלים התייצבה מול גדר הגבול: "תקענו בשופר, פלוגות מלאכים כבר בדרך להחליף חיילים".',
          source: 'חרדים 10',
        },
        en: {
          headline: 'Kabbalists gather at border fence: "We blew the ram\'s horn, angelic legions are deploying to replace troops".',
          source: 'Haredim 10',
        },
        category: 'rabbis',
      },
      {
        he: {
          headline: 'עדכון מהגבול: המקובלים עזבו עקב שרב כבד; השאירו קמיע נגד רחפנים קשור לגדר.',
          source: 'מבזקי חב״ד',
        },
        en: {
          headline: 'Border update: Kabbalists leave due to extreme heat; left an anti-drone amulet tied to the fence.',
          source: 'Chabad Flashes',
        },
        category: 'rabbis',
      },
    ],
  },

  // 7. Reality TV Cottage Cheese Escapism
  {
    id: 'big_brother_cottage',
    steps: [
      {
        he: {
          headline: 'דרמה בבית האח הגדול: ריב צעקות היסטרי על תקציב הגבינה הלבנה גרם להפסקת השידור החי.',
          source: 'ערוץ 26',
        },
        en: {
          headline: 'Big Brother drama: Screaming brawl over cottage cheese budget forces live broadcast shut down.',
          source: 'Channel 26',
        },
        category: 'celebs',
      },
      {
        he: {
          headline: 'מדרוג שיא של 42% רייטינג לוויכוח על הגבינה הלבנה בזמן שהקבינט הביטחוני מכנס דיון חירום.',
          source: 'ועדת המדרוג',
        },
        en: {
          headline: 'Record 42% TV rating for the cottage cheese feud while Security Cabinet holds emergency session.',
          source: 'Rating Board',
        },
        category: 'celebs',
      },
      {
        he: {
          headline: 'הדחה דרמטית: הדייר שהחביא את הקוטג\' הודח ומתראיין: "העם יודע מי אכל את הגבינה ומי שמר על הגבול".',
          source: 'מאקו סלבס',
        },
        en: {
          headline: 'Eviction drama: Housemate who hid the cheese is evicted: "The nation knows who ate and who guarded".',
          source: 'Mako Celebs',
        },
        category: 'celebs',
      },
    ],
  },

  // 8. Ofira and Berko Studio Feud
  {
    id: 'ofira_and_berko',
    steps: [
      {
        he: {
          headline: 'אופירה וברקוביץ\' בוויכוח סוער: "ברקו, תסתכל לי בעיניים ותגיד לי מי שומר על הגבול!".',
          source: 'אולפן שישי',
        },
        en: {
          headline: 'Ofira & Berko heated clash: "Berko, look into my eyes and tell me who is defending the border!".',
          source: 'Friday Studio',
        },
        category: 'celebs',
      },
      {
        he: {
          headline: 'ברקו הטיח את האוזנייה על השולחן: "בושה וחרפה! אפילו בהפועל בית שאן ידעו לסגור קו הגנה!".',
          source: 'ערוץ 12',
        },
        en: {
          headline: 'Berko slams earpiece on desk: "Disgrace! Even in Hapoel Beit She\'an they knew how to keep a backline!".',
          source: 'Channel 12',
        },
        category: 'celebs',
      },
    ],
  },

  // 9. Tally Gotliv & Dudi Amsalem
  {
    id: 'gotliv_and_amsalem',
    steps: [
      {
        he: {
          headline: 'טלי גוטליב במליאה: "אני לא צועקת, זו התדר המדויק של האמת הצרופה!".',
          source: 'ערוץ הכנסת',
        },
        en: {
          headline: 'MK Tally Gotliv in Knesset: "I am not screaming, this is the exact frequency of pure truth!".',
          source: 'Knesset TV',
        },
        category: 'politics',
      },
      {
        he: {
          headline: 'סדרני הכנסת חילקו אטמי אוזניים לחברי האופוזיציה במהלך נאומה של ח״כ גוטליב.',
          source: 'ערוץ הכנסת',
        },
        en: {
          headline: 'Knesset ushers distribute earplugs to opposition members during MK Gotliv\'s passionate address.',
          source: 'Knesset TV',
        },
        category: 'politics',
      },
      {
        he: {
          headline: 'דודי אמסלם מעל הדוכן: "הם לא שותים עראק, האליטות האלה חמוצים כמו מלפפון במלח!".',
          source: 'מליאת הכנסת',
        },
        en: {
          headline: 'Dudi Amsalem at the podium: "They don\'t drink arak, these elites are sour as pickled cucumbers!".',
          source: 'Knesset Plenum',
        },
        category: 'politics',
      },
    ],
  },

  // 10. Yinon Magal Tweets
  {
    id: 'yinon_magal_tweets',
    steps: [
      {
        he: {
          headline: 'ינון מגל בציוץ: "מה אתם מבינים באסטרטגיה? הקבינט מנהל את העסק בגאונות שטרם נראתה".',
          source: 'טוויטר / X',
        },
        en: {
          headline: 'Yinon Magal tweets: "What do you know of strategy? The Cabinet is running this with unprecedented genius".',
          source: 'Twitter / X',
        },
        category: 'politics',
      },
      {
        he: {
          headline: 'ינון מגל בעוד ציוץ: "סקר ערוץ 12 מפוברק. יצאתי לשוק הכרמל וכולם ביקשו להעביר עוד גדודים למאחזים".',
          source: 'טוויטר / X',
        },
        en: {
          headline: 'Yinon Magal tweets again: "Channel 12 poll is fake. I went to Carmel Market, everyone wants more troops at outposts".',
          source: 'Twitter / X',
        },
        category: 'politics',
      },
    ],
  },
];

export const STANDALONE_QUOTES: StoryArcStep[] = [
  {
    he: {
      headline: 'איילת שקד: "לו רק הייתי שרת המשפטים, הפסיקה על פריסת הכוחות הייתה נראית אחרת לגמרי".',
      source: 'ראיון סופ״ש',
    },
    en: {
      headline: 'Ayelet Shaked: "If only I were Justice Minister, the ruling on troop deployment would be totally different".',
      source: 'Weekend Interview',
    },
    category: 'politics',
  },
  {
    he: {
      headline: 'יאיר לפיד בראיון: "ישבתי עם מומחים בינלאומיים בבית קפה ברמת אביב והם המומים מהמצב".',
      source: 'פודקאסט שבועי',
    },
    en: {
      headline: 'Yair Lapid: "I sat with international experts at a Ramat Aviv café and they were completely stunned".',
      source: 'Weekly Podcast',
    },
    category: 'politics',
  },
  {
    he: {
      headline: 'איתמר בן גביר הגיע לעוטף עם מגפון: "בעל הבית השתגע, עכשיו אני בעל הבית!".',
      source: 'טיקטוק רשמי',
    },
    en: {
      headline: 'Itamar Ben-Gvir arrives at border with megaphone: "The boss went crazy, now I am the boss!".',
      source: 'Official TikTok',
    },
    category: 'politics',
  },
  {
    he: {
      headline: 'הרב מאזוז: "חייל שהניח תפילין בבוקר מוגן לחלוטין מכל פצמ״ר, רחפן וטיל".',
      source: 'שיעור שבועי',
    },
    en: {
      headline: 'Rabbi Mazuz: "A soldier who wore tefillin this morning is totally protected from all mortars, drones, and rockets".',
      source: 'Weekly Lecture',
    },
    category: 'rabbis',
  },
  {
    he: {
      headline: 'גדעון סער בציוץ לקוני: "עוקב בדאגה עמוקה אחרי הדיווחים מהדרום. הממלכתיות תחזור".',
      source: 'טוויטר / X',
    },
    en: {
      headline: 'Gideon Sa\'ar terse tweet: "Following reports from the South with deep concern. Statesmanship will return".',
      source: 'Twitter / X',
    },
    category: 'politics',
  },
  {
    he: {
      headline: 'ישראל כ״ץ: "הנחיתי את רכבת ישראל להאט בסיבובים כדי לחסוך בדלק לטנקים".',
      source: 'משרד האנרגיה והתשתיות',
    },
    en: {
      headline: 'Israel Katz: "I instructed Israel Railways to slow down on turns to conserve fuel for tanks".',
      source: 'Energy Ministry',
    },
    category: 'politics',
  },
  {
    he: {
      headline: 'סטטיק נצפה בצילומי קליפ במאחז גבעות מבודד: "וייב של נוער הגבעות, זה הלהיט הבא של הקיץ".',
      source: 'ערב טוב עם גיא פינס',
    },
    en: {
      headline: 'Static spotted filming music video at isolated outpost: "Hilltop youth vibes, this is the summer anthem".',
      source: 'Good Evening',
    },
    category: 'celebs',
  },
  {
    he: {
      headline: 'ליברמן: "תוך 48 שעות הייתי פותר את עניין הגבול, הבעיה שהאספרסו פה בכנסת פושר".',
      source: 'ישראל ביתנו',
    },
    en: {
      headline: 'Lieberman: "In 48 hours I would fix the border, problem is the Knesset espresso is lukewarm".',
      source: 'Yisrael Beytenu',
    },
    category: 'politics',
  },
  {
    he: {
      headline: 'בנימין נתניהו בסרטון טיקטוק: "שואלים אותי מה עם הגבול? אני אומר לכם: ניצחון מוחלט מובטח!".',
      source: 'ערוץ רשמי',
    },
    en: {
      headline: 'Benjamin Netanyahu on TikTok: "They ask about the border? I tell you: absolute victory is guaranteed!".',
      source: 'Official Channel',
    },
    category: 'politics',
  },
  {
    he: {
      headline: 'נתניהו במסיבת עיתונאים: "אני שומע את שאלתך, עיתונאי חמוץ. התשובה שלי: לא היה כלום כי אין כלום".',
      source: 'תדרוך עיתונאים',
    },
    en: {
      headline: 'Netanyahu at press conference: "I hear your question, sour journalist. My answer: there was nothing because there is nothing".',
      source: 'Press Briefing',
    },
    category: 'politics',
  },
  {
    he: {
      headline: 'נתניהו מקבל מגש גלידת פיסטוק ללשכה: "הביטחון איתן, ההתיישבות פורחת, והפיסטוק פשוט מעולה".',
      source: 'ידיעות אחרונות',
    },
    en: {
      headline: 'Netanyahu receives pistachio ice cream in his office: "Security is robust, settlements thrive, and the pistachio is superb".',
      source: 'Yedioth Ahronoth',
    },
    category: 'politics',
  },
  {
    he: {
      headline: 'יואב גלנט בפנים חמורות סבר: "העיניים על המטרה, אבל שר האוצר מסרב לחתום על הזמנת תחמושת".',
      source: 'תדרוך הקריה בת״א',
    },
    en: {
      headline: 'Yoav Gallant stern-faced: "Eyes on target, but the Finance Minister refuses to sign ammunition orders".',
      source: 'Kirya Briefing',
    },
    category: 'military',
  },
];

/**
 * Returns the next juicy news item, driven directly by actual GAME PROGRESS:
 * - Building settlements advances settlement/political/celeb arcs (Ben Gvir keychains -> Smotrich -> Noa Kirel & Daniel Peretz wedding -> couscous in Munich!)
 * - Deploying troops & lowering defense triggers military/political clash arcs (Yair Golan -> Miri Regev -> Ofira & Berko -> Kabbalists)
 * - Mobilizing reserves triggers economic strain & coalition commentary arcs
 * - Recalling troops / Evacuating outposts triggers rational defense arcs
 * - Ambient timer naturally carries ongoing storylines between actions
 */
export function getProgressiveNews(
  state: GameState,
  trigger: 'build' | 'deploy' | 'reserves' | 'recall' | 'timer' = 'timer'
): { item: NewsItem; nextArcs: Record<string, number> } {
  const currentArcs = { ...state.activeStoryArcs };
  const locale = state.locale;

  // Helper to format a news item for a specific arc step
  const buildItemForArc = (arcId: string, stepIndex: number): NewsItem => {
    const arc = STORY_ARCS.find(a => a.id === arcId)!;
    const stepData = arc.steps[stepIndex];
    const text = stepData[locale] || stepData.he;
    return {
      id: `news-arc-${arcId}-${stepIndex}-${Date.now()}`,
      headline: text.headline,
      source: text.source,
      headlineHe: stepData.he.headline,
      headlineEn: stepData.en.headline,
      sourceHe: stepData.he.source,
      sourceEn: stepData.en.source,
      category: stepData.category,
      arcId,
      arcStep: stepIndex + 1,
      totalArcSteps: arc.steps.length,
      timestamp: new Date().toLocaleTimeString(locale === 'he' ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      isUrgent: false,
    };
  };

  // Helper to advance or start a specific arc
  const advanceArc = (arcId: string): NewsItem | null => {
    const arc = STORY_ARCS.find(a => a.id === arcId);
    if (!arc) return null;
    const currentStep = currentArcs[arcId];
    if (currentStep === undefined) {
      currentArcs[arcId] = 0;
      return buildItemForArc(arcId, 0);
    } else if (currentStep + 1 < arc.steps.length) {
      const nextStep = currentStep + 1;
      currentArcs[arcId] = nextStep;
      return buildItemForArc(arcId, nextStep);
    }
    return null;
  };

  // 1. GAME-PROGRESS BASED TARGETING
  let targetedNews: NewsItem | null = null;

  if (trigger === 'build') {
    const count = state.settlementsCount;
    if (count <= 2) {
      targetedNews = advanceArc('bibi_and_bengvir') || advanceArc('ben_gvir_keychains');
    } else if (count <= 4) {
      targetedNews = advanceArc('bibi_red_marker') || advanceArc('smotrich_miracles') || advanceArc('bibi_and_bengvir');
    } else if (count <= 6) {
      targetedNews = advanceArc('noa_and_daniel') || advanceArc('bibi_and_bengvir') || advanceArc('smotrich_miracles');
    } else if (count <= 8) {
      targetedNews = advanceArc('bibi_red_marker') || advanceArc('noa_and_daniel') || advanceArc('ben_gvir_keychains');
    } else {
      targetedNews = advanceArc('big_brother_cottage') || advanceArc('bibi_red_marker') || advanceArc('noa_and_daniel');
    }
  } else if (trigger === 'deploy') {
    const score = state.defenseScore;
    if (score >= 60) {
      targetedNews = advanceArc('bibi_and_bengvir') || advanceArc('yair_golan_quotes');
    } else if (score >= 35) {
      targetedNews = advanceArc('bibi_and_gotliv') || advanceArc('miri_regev_ribbon') || advanceArc('yair_golan_quotes');
    } else if (score >= 15) {
      targetedNews = advanceArc('bibi_red_marker') || advanceArc('ofira_and_berko') || advanceArc('miri_regev_ribbon');
    } else {
      targetedNews = advanceArc('bibi_and_gotliv') || advanceArc('rabbis_kabbalah') || advanceArc('gotliv_and_amsalem');
    }
  } else if (trigger === 'reserves') {
    targetedNews = advanceArc('bibi_and_gotliv') || advanceArc('yinon_magal_tweets') || advanceArc('smotrich_miracles');
  } else if (trigger === 'recall') {
    targetedNews = advanceArc('bibi_red_marker') || advanceArc('yair_golan_quotes') || advanceArc('rabbis_kabbalah');
  }

  if (targetedNews) {
    return { item: targetedNews, nextArcs: currentArcs };
  }

  // 2. TIMED / IDLE CONTINUATION OF ONGOING ARCS
  // If an arc is in-flight (started but not finished), continue it!
  const inFlightArc = Object.entries(currentArcs).find(([arcId, currentStep]) => {
    const arc = STORY_ARCS.find(a => a.id === arcId);
    return arc && currentStep + 1 < arc.steps.length;
  });

  if (inFlightArc) {
    const [arcId, currentStep] = inFlightArc;
    const nextStep = currentStep + 1;
    currentArcs[arcId] = nextStep;
    return { item: buildItemForArc(arcId, nextStep), nextArcs: currentArcs };
  }

  // 3. START ANY UNSTARTED ARC OR FALLBACK TO QUOTE
  const availableArcs = STORY_ARCS.filter(a => !(a.id in currentArcs));
  if (availableArcs.length > 0 && Math.random() < 0.65) {
    const chosenArc = availableArcs[Math.floor(Math.random() * availableArcs.length)];
    currentArcs[chosenArc.id] = 0;
    return { item: buildItemForArc(chosenArc.id, 0), nextArcs: currentArcs };
  }

  // Fallback to random standalone quote
  const chosenQuote = STANDALONE_QUOTES[Math.floor(Math.random() * STANDALONE_QUOTES.length)];
  const text = chosenQuote[locale] || chosenQuote.he;
  const item: NewsItem = {
    id: `news-quote-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    headline: text.headline,
    source: text.source,
    headlineHe: chosenQuote.he.headline,
    headlineEn: chosenQuote.en.headline,
    sourceHe: chosenQuote.he.source,
    sourceEn: chosenQuote.en.source,
    category: chosenQuote.category,
    timestamp: new Date().toLocaleTimeString(locale === 'he' ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
    isUrgent: false,
  };

  return { item, nextArcs: currentArcs };
}

export const getNextJuicyNews = (state: GameState) => getProgressiveNews(state, 'timer');

