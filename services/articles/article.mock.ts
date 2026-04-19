/**
 * =============================================================================
 * DUMMY ARTICLE SERVICE - FOR DEVELOPMENT AND TESTING PURPOSES ONLY
 * =============================================================================
 * 
 * This module provides mock data that mimics Contentful API responses for articles.
 * It is intended to be used during development when the actual Contentful content
 * type is not yet available.
 * 
 * TO SWITCH TO REAL CONTENTFUL DATA:
 * 1. Ensure the "Article" content type exists in Contentful with required fields
 * 2. Update imports in pages/components from './article.mock' to './article.service'
 * 3. Or simply delete this file and rename article.service.ts imports
 * 
 * REQUIRED CONTENTFUL FIELDS:
 * - title (Short text)
 * - slug (Short text, unique)
 * - excerpt (Long text)
 * - author (Short text)
 * - date (Date)
 * - body (Rich text)
 * - category (Short text)
 * - tags (Short text, list)
 * - metaTitle (Short text)
 * - metaDescription (Long text)
 * - coverImage (Media)
 * =============================================================================
 */

import { cache } from 'react';
import Config from "@/config/config.json";
import { WithContext, Article as SchemaArticle, ItemList, Person } from 'schema-dts';

// =============================================================================
// MOCK DATA
// =============================================================================

const DUMMY_ARTICLES = [
  {
    sys: {
      id: "article-1",
      publishedAt: "2024-01-15T10:00:00Z"
    },
    title: "The Importance of Seeking Knowledge in Islam",
    slug: "importance-of-seeking-knowledge-in-islam",
    excerpt: "Islam places great emphasis on the pursuit of knowledge. The Prophet Muhammad (peace be upon him) said, 'Seeking knowledge is an obligation upon every Muslim.' This article explores the virtues and methods of acquiring beneficial knowledge.",
    author: "Maulana Ahmad",
    date: "2024-01-15",
    body: {
      json: {
        nodeType: "document",
        data: {},
        content: [
          {
            nodeType: "heading-2",
            data: {},
            content: [{ nodeType: "text", value: "The Obligation of Seeking Knowledge", marks: [], data: {} }]
          },
          {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: "Islam is unique among world religions in its emphasis on knowledge. The very first revelation to Prophet Muhammad (peace be upon him) began with the command 'Iqra' - Read! This single word set the foundation for a civilization built upon learning, understanding, and the pursuit of truth.", marks: [], data: {} }]
          },
          {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: "The Prophet (peace be upon him) said: 'Seeking knowledge is an obligation upon every Muslim.' (Ibn Majah) This hadith establishes that learning is not merely encouraged but required of every believer, regardless of their status, gender, or background.", marks: [], data: {} }]
          },
          {
            nodeType: "heading-2",
            data: {},
            content: [{ nodeType: "text", value: "Types of Knowledge", marks: [], data: {} }]
          },
          {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: "Islamic scholars have categorized knowledge into different types. The most important is knowledge of the Quran and Sunnah, followed by knowledge that benefits the community such as medicine, engineering, and other sciences. All beneficial knowledge is considered a form of worship when pursued with the right intention.", marks: [], data: {} }]
          },
          {
            nodeType: "heading-2",
            data: {},
            content: [{ nodeType: "text", value: "Etiquette of Seeking Knowledge", marks: [], data: {} }]
          },
          {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: "The student of knowledge should approach learning with humility, sincerity, and patience. Imam Al-Shafi'i said: 'Whoever does not bear the humiliation of learning for an hour will remain in the humiliation of ignorance forever.' The pursuit of knowledge requires dedication and perseverance.", marks: [], data: {} }]
          }
        ]
      },
      links: {
        assets: {
          block: []
        }
      }
    },
    category: "Education",
    tags: ["Knowledge", "Islam", "Learning", "Hadith"],
    metaTitle: "The Importance of Seeking Knowledge in Islam | Ulama Moris",
    metaDescription: "Discover why Islam places such great emphasis on seeking knowledge and how Muslims can pursue beneficial learning in their daily lives.",
    coverImage: {
      sys: { id: "img-1" },
      title: "Islamic Knowledge",
      description: "Books and Quran representing Islamic knowledge",
      url: "https://images.unsplash.com/photo-1585036156171-384164a8c675?w=800&h=600&fit=crop",
      width: 800,
      height: 600
    }
  },
  {
    sys: {
      id: "article-2",
      publishedAt: "2024-01-10T10:00:00Z"
    },
    title: "Understanding the Five Pillars of Islam",
    slug: "understanding-five-pillars-of-islam",
    excerpt: "The Five Pillars of Islam form the foundation of Muslim life. These essential practices guide believers in their worship and daily conduct, creating a framework for spiritual growth and community unity.",
    author: "Sheikh Abdullah",
    date: "2024-01-10",
    body: {
      json: {
        nodeType: "document",
        data: {},
        content: [
          {
            nodeType: "heading-2",
            data: {},
            content: [{ nodeType: "text", value: "Shahada - The Declaration of Faith", marks: [], data: {} }]
          },
          {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: "The Shahada is the first pillar and the foundation upon which all other pillars rest. It is the testimony that 'There is no god but Allah, and Muhammad is the Messenger of Allah.' This simple yet profound declaration encompasses the entire essence of Islamic belief.", marks: [], data: {} }]
          },
          {
            nodeType: "heading-2",
            data: {},
            content: [{ nodeType: "text", value: "Salah - The Five Daily Prayers", marks: [], data: {} }]
          },
          {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: "Prayer is the second pillar and serves as the direct connection between the believer and Allah. Muslims pray five times daily: Fajr (dawn), Dhuhr (midday), Asr (afternoon), Maghrib (sunset), and Isha (night). Each prayer is a moment of spiritual renewal and remembrance.", marks: [], data: {} }]
          },
          {
            nodeType: "heading-2",
            data: {},
            content: [{ nodeType: "text", value: "Zakat - Obligatory Charity", marks: [], data: {} }]
          },
          {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: "Zakat is the third pillar, requiring Muslims who possess wealth above a certain threshold to give 2.5% annually to those in need. This practice purifies wealth, promotes social justice, and strengthens community bonds.", marks: [], data: {} }]
          }
        ]
      },
      links: {
        assets: {
          block: []
        }
      }
    },
    category: "Fundamentals",
    tags: ["Five Pillars", "Faith", "Worship", "Basics"],
    metaTitle: "Understanding the Five Pillars of Islam | Ulama Moris",
    metaDescription: "Learn about the Five Pillars of Islam - Shahada, Salah, Zakat, Sawm, and Hajj - the essential practices that guide every Muslim's spiritual journey.",
    coverImage: {
      sys: { id: "img-2" },
      title: "Five Pillars",
      description: "Mosque representing Islamic worship",
      url: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&h=600&fit=crop",
      width: 800,
      height: 600
    }
  },
  {
    sys: {
      id: "article-3",
      publishedAt: "2024-01-05T10:00:00Z"
    },
    title: "The Beautiful Names of Allah (Asma ul Husna)",
    slug: "beautiful-names-of-allah-asma-ul-husna",
    excerpt: "Allah has revealed 99 beautiful names (Asma ul Husna) that describe His divine attributes. Understanding these names deepens our connection with our Creator and enhances our worship.",
    author: "Mufti Ibrahim",
    date: "2024-01-05",
    body: {
      json: {
        nodeType: "document",
        data: {},
        content: [
          {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: "The Prophet Muhammad (peace be upon him) said: 'Allah has ninety-nine names, one hundred minus one. Whoever memorizes and acts upon them will enter Paradise.' (Bukhari) These names are not merely to be memorized but to be understood, reflected upon, and embodied in our lives.", marks: [], data: {} }]
          },
          {
            nodeType: "heading-2",
            data: {},
            content: [{ nodeType: "text", value: "Categories of Divine Names", marks: [], data: {} }]
          },
          {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: "The names of Allah can be categorized into those relating to His essence (such as Al-Ahad - The One), His attributes of beauty (such as Ar-Rahman - The Most Merciful), and His attributes of majesty (such as Al-Jabbar - The Compeller). Understanding these categories helps us appreciate the completeness of Allah's perfection.", marks: [], data: {} }]
          }
        ]
      },
      links: {
        assets: {
          block: []
        }
      }
    },
    category: "Aqeedah",
    tags: ["Names of Allah", "Asma ul Husna", "Tawheed", "Worship"],
    metaTitle: "The Beautiful Names of Allah (Asma ul Husna) | Ulama Moris",
    metaDescription: "Explore the 99 beautiful names of Allah and learn how understanding these divine attributes can transform your relationship with your Creator.",
    coverImage: {
      sys: { id: "img-3" },
      title: "Divine Names",
      description: "Islamic calligraphy representing Allah's names",
      url: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&h=600&fit=crop",
      width: 800,
      height: 600
    }
  },
  {
    sys: {
      id: "article-4",
      publishedAt: "2024-01-01T10:00:00Z"
    },
    title: "The Life of Prophet Muhammad (PBUH): A Brief Overview",
    slug: "life-of-prophet-muhammad-brief-overview",
    excerpt: "Prophet Muhammad (peace be upon him) was born in Makkah in 570 CE and received revelation at age 40. His life serves as the perfect example for Muslims to follow in all aspects of life.",
    author: "Dr. Yusuf Ali",
    date: "2024-01-01",
    body: {
      json: {
        nodeType: "document",
        data: {},
        content: [
          {
            nodeType: "heading-2",
            data: {},
            content: [{ nodeType: "text", value: "Early Life", marks: [], data: {} }]
          },
          {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: "Muhammad (peace be upon him) was born in the Year of the Elephant (570 CE) in Makkah. Orphaned at a young age, he was raised first by his grandfather Abdul Muttalib and then by his uncle Abu Talib. Even before prophethood, he was known as Al-Amin (The Trustworthy) and As-Sadiq (The Truthful).", marks: [], data: {} }]
          },
          {
            nodeType: "heading-2",
            data: {},
            content: [{ nodeType: "text", value: "The Revelation", marks: [], data: {} }]
          },
          {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: "At the age of 40, while meditating in the Cave of Hira, Muhammad (peace be upon him) received the first revelation from Allah through the Angel Jibreel. The first words revealed were 'Iqra' (Read), marking the beginning of a 23-year period of revelation that would complete the Quran.", marks: [], data: {} }]
          }
        ]
      },
      links: {
        assets: {
          block: []
        }
      }
    },
    category: "Seerah",
    tags: ["Prophet Muhammad", "Seerah", "History", "Biography"],
    metaTitle: "The Life of Prophet Muhammad (PBUH): A Brief Overview | Ulama Moris",
    metaDescription: "Learn about the life, teachings, and legacy of Prophet Muhammad (peace be upon him), the final messenger of Allah.",
    coverImage: {
      sys: { id: "img-4" },
      title: "Prophet's Life",
      description: "Historical representation of Madinah",
      url: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&h=600&fit=crop",
      width: 800,
      height: 600
    }
  },
  {
    sys: {
      id: "article-5",
      publishedAt: "2023-12-25T10:00:00Z"
    },
    title: "The Virtues of Ramadan and Fasting",
    slug: "virtues-of-ramadan-and-fasting",
    excerpt: "Ramadan is the ninth month of the Islamic calendar and the holiest month for Muslims. It is a time of spiritual reflection, increased devotion, and the opportunity to earn immense rewards.",
    author: "Maulana Hassan",
    date: "2023-12-25",
    body: {
      json: {
        nodeType: "document",
        data: {},
        content: [
          {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: "Ramadan is a month of immense blessing and mercy. The Prophet (peace be upon him) said: 'When Ramadan begins, the gates of Paradise are opened, the gates of Hell are closed, and the devils are chained.' (Bukhari and Muslim)", marks: [], data: {} }]
          },
          {
            nodeType: "heading-2",
            data: {},
            content: [{ nodeType: "text", value: "The Benefits of Fasting", marks: [], data: {} }]
          },
          {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: "Fasting develops self-discipline, patience, and gratitude. It reminds us of those less fortunate and increases our empathy and charitable giving. Allah says in the Quran: 'Fasting is prescribed for you as it was prescribed for those before you, that you may become righteous.' (2:183)", marks: [], data: {} }]
          }
        ]
      },
      links: {
        assets: {
          block: []
        }
      }
    },
    category: "Worship",
    tags: ["Ramadan", "Fasting", "Sawm", "Ibadah"],
    metaTitle: "The Virtues of Ramadan and Fasting | Ulama Moris",
    metaDescription: "Discover the spiritual benefits and virtues of fasting during the blessed month of Ramadan.",
    coverImage: {
      sys: { id: "img-5" },
      title: "Ramadan",
      description: "Dates and Quran representing Ramadan",
      url: "https://images.unsplash.com/photo-1548352599-413c8b2703d1?q=80&w=870&auto=format&fit=crop",
      width: 800,
      height: 600
    }
  },
  {
    sys: {
      id: "article-6",
      publishedAt: "2023-12-20T10:00:00Z"
    },
    title: "The Etiquette of Dua (Supplication)",
    slug: "etiquette-of-dua-supplication",
    excerpt: "Dua is the essence of worship and a direct conversation with Allah. Learning the proper etiquette of making dua can help ensure our supplications are accepted.",
    author: "Sheikh Khalid",
    date: "2023-12-20",
    body: {
      json: {
        nodeType: "document",
        data: {},
        content: [
          {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: "The Prophet (peace be upon him) said: 'Dua is worship.' (Abu Dawud) When we raise our hands to Allah, we acknowledge His power, mercy, and ability to fulfill our needs. This act of humility and dependence is beloved to Allah.", marks: [], data: {} }]
          },
          {
            nodeType: "heading-2",
            data: {},
            content: [{ nodeType: "text", value: "Best Times for Dua", marks: [], data: {} }]
          },
          {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: "While dua can be made at any time, certain moments are especially blessed: the last third of the night, between the adhan and iqamah, while prostrating in prayer, on Fridays, and during Ramadan. Seeking these times increases the likelihood of acceptance.", marks: [], data: {} }]
          }
        ]
      },
      links: {
        assets: {
          block: []
        }
      }
    },
    category: "Worship",
    tags: ["Dua", "Supplication", "Prayer", "Worship"],
    metaTitle: "The Etiquette of Dua (Supplication) | Ulama Moris",
    metaDescription: "Learn the proper etiquette and best times for making dua to ensure your supplications reach Allah.",
    coverImage: {
      sys: { id: "img-6" },
      title: "Dua",
      description: "Hands raised in supplication",
      url: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&h=600&fit=crop",
      width: 800,
      height: 600
    }
  },
  {
    sys: {
      id: "article-7",
      publishedAt: "2023-12-15T10:00:00Z"
    },
    title: "Islamic Parenting: Raising Righteous Children",
    slug: "islamic-parenting-raising-righteous-children",
    excerpt: "Raising children upon Islamic values is one of the greatest responsibilities and rewards for Muslim parents. This article explores key principles for nurturing faith in the next generation.",
    author: "Ustadha Fatima",
    date: "2023-12-15",
    body: {
      json: {
        nodeType: "document",
        data: {},
        content: [
          {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: "The Prophet (peace be upon him) said: 'When a person dies, their deeds come to an end except for three: ongoing charity, beneficial knowledge, or a righteous child who prays for them.' (Muslim) This hadith highlights the lasting impact of raising children with strong Islamic values.", marks: [], data: {} }]
          },
          {
            nodeType: "heading-2",
            data: {},
            content: [{ nodeType: "text", value: "Leading by Example", marks: [], data: {} }]
          },
          {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: "Children learn more from what they observe than what they are told. Parents who consistently practice their faith, show kindness, and embody Islamic character create an environment where children naturally absorb these values.", marks: [], data: {} }]
          }
        ]
      },
      links: {
        assets: {
          block: []
        }
      }
    },
    category: "Family",
    tags: ["Parenting", "Children", "Family", "Education"],
    metaTitle: "Islamic Parenting: Raising Righteous Children | Ulama Moris",
    metaDescription: "Discover Islamic principles for raising children with strong faith, good character, and lasting values.",
    coverImage: {
      sys: { id: "img-7" },
      title: "Parenting",
      description: "Family reading Quran together",
      url: "https://images.unsplash.com/photo-1536147116438-62679a5e01f2?w=800&h=600&fit=crop",
      width: 800,
      height: 600
    }
  },
  {
    sys: {
      id: "article-8",
      publishedAt: "2023-12-10T10:00:00Z"
    },
    title: "The Significance of Jumu'ah (Friday Prayer)",
    slug: "significance-of-jumuah-friday-prayer",
    excerpt: "Friday is the most blessed day of the week in Islam. The congregational Jumu'ah prayer holds special significance and carries immense rewards for those who attend with proper etiquette.",
    author: "Imam Rashid",
    date: "2023-12-10",
    body: {
      json: {
        nodeType: "document",
        data: {},
        content: [
          {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: "The Prophet (peace be upon him) said: 'The best day on which the sun rises is Friday. On it Adam was created, on it he was admitted to Paradise, and on it he was expelled from it.' (Muslim)", marks: [], data: {} }]
          },
          {
            nodeType: "heading-2",
            data: {},
            content: [{ nodeType: "text", value: "Etiquette of Jumu'ah", marks: [], data: {} }]
          },
          {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: "Preparing for Jumu'ah includes taking a bath (ghusl), wearing clean clothes, applying perfume, arriving early, and listening attentively to the khutbah (sermon). These acts increase the rewards and blessings of this special day.", marks: [], data: {} }]
          }
        ]
      },
      links: {
        assets: {
          block: []
        }
      }
    },
    category: "Worship",
    tags: ["Jumu'ah", "Friday", "Prayer", "Congregation"],
    metaTitle: "The Significance of Jumu'ah (Friday Prayer) | Ulama Moris",
    metaDescription: "Learn about the virtues and proper etiquette of the blessed Friday prayer in Islam.",
    coverImage: {
      sys: { id: "img-8" },
      title: "Jumu'ah",
      description: "Muslims gathering for Friday prayer",
      url: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&h=600&fit=crop",
      width: 800,
      height: 600
    }
  },
  {
    sys: {
      id: "article-9",
      publishedAt: "2023-12-05T10:00:00Z"
    },
    title: "Purification of the Heart in Islam",
    slug: "purification-of-the-heart-in-islam",
    excerpt: "The heart is the center of faith and spirituality. Islam teaches us to purify our hearts from spiritual diseases like arrogance, envy, and hypocrisy to achieve closeness to Allah.",
    author: "Maulana Tariq",
    date: "2023-12-05",
    body: {
      json: {
        nodeType: "document",
        data: {},
        content: [
          {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: "Allah says in the Quran: 'The Day when neither wealth nor children will be of any benefit, except for one who comes to Allah with a sound heart.' (26:88-89) This verse emphasizes that ultimately, it is the state of our hearts that matters most.", marks: [], data: {} }]
          },
          {
            nodeType: "heading-2",
            data: {},
            content: [{ nodeType: "text", value: "Diseases of the Heart", marks: [], data: {} }]
          },
          {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: "Scholars have identified numerous spiritual diseases including kibr (arrogance), hasad (envy), riya (showing off), and hubb ad-dunya (excessive love of the world). Recognizing these ailments is the first step toward healing.", marks: [], data: {} }]
          }
        ]
      },
      links: {
        assets: {
          block: []
        }
      }
    },
    category: "Spirituality",
    tags: ["Heart", "Tazkiyah", "Purification", "Spirituality"],
    metaTitle: "Purification of the Heart in Islam | Ulama Moris",
    metaDescription: "Learn how to purify your heart from spiritual diseases and achieve a sound heart that is pleasing to Allah.",
    coverImage: {
      sys: { id: "img-9" },
      title: "Heart Purification",
      description: "Peaceful Islamic setting",
      url: "https://images.unsplash.com/photo-1689615056451-107d2085df1b?q=80&w=800&auto=format&fit=crop",
      width: 800,
      height: 600
    }
  },
  {
    sys: {
      id: "article-10",
      publishedAt: "2023-12-01T10:00:00Z"
    },
    title: "Understanding Halal and Haram in Daily Life",
    slug: "understanding-halal-haram-daily-life",
    excerpt: "Islam provides clear guidance on what is permissible (halal) and prohibited (haram). Understanding these principles helps Muslims navigate daily life while maintaining their faith.",
    author: "Dr. Amina Khan",
    date: "2023-12-01",
    body: {
      json: {
        nodeType: "document",
        data: {},
        content: [
          {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: "The concepts of halal and haram are fundamental to Islamic life. The Prophet (peace be upon him) said: 'The halal is clear and the haram is clear, and between them are matters that are doubtful which many people do not know. Whoever avoids the doubtful matters has protected his religion and his honor.' (Bukhari and Muslim)", marks: [], data: {} }]
          },
          {
            nodeType: "heading-2",
            data: {},
            content: [{ nodeType: "text", value: "Principles of Halal and Haram", marks: [], data: {} }]
          },
          {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: "The default ruling in Islam is that things are permissible unless explicitly prohibited. Prohibitions exist to protect human beings from harm to their faith, life, intellect, progeny, and wealth - the five essential objectives of Islamic law (maqasid al-shariah).", marks: [], data: {} }]
          }
        ]
      },
      links: {
        assets: {
          block: []
        }
      }
    },
    category: "Fiqh",
    tags: ["Halal", "Haram", "Fiqh", "Daily Life"],
    metaTitle: "Understanding Halal and Haram in Daily Life | Ulama Moris",
    metaDescription: "Learn the principles of halal and haram in Islam and how to apply them in your everyday decisions.",
    coverImage: {
      sys: { id: "img-10" },
      title: "Halal Living",
      description: "Islamic lifestyle representation",
      url: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800&h=600&fit=crop",
      width: 800,
      height: 600
    }
  }
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const filterArticles = (articles: typeof DUMMY_ARTICLES, search: string, category: string) => {
  return articles.filter(article => {
    const matchesSearch = !search ||
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      article.author.toLowerCase().includes(search.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = !category ||
      article.category.toLowerCase() === category.toLowerCase();

    return matchesSearch && matchesCategory;
  });
};

// =============================================================================
// MOCK SERVICE FUNCTIONS
// =============================================================================

export const getArticlesBase = cache(async ({
  search = "",
  category = "",
  limit = 0,
  skip = 0,
}: {
  limit?: number;
  skip?: number;
  search?: string;
  category?: string;
  isPreview?: boolean;
}): Promise<{ articleCollection: any }> => {

  // Simulate API delay for realistic behavior
  await new Promise(resolve => setTimeout(resolve, 100));

  let filtered = filterArticles(DUMMY_ARTICLES, search, category);
  const total = filtered.length;

  if (skip > 0) {
    filtered = filtered.slice(skip);
  }

  if (limit > 0) {
    filtered = filtered.slice(0, limit);
  }

  return {
    articleCollection: {
      items: filtered,
      total
    }
  };
});

export const getArticlesWithPagination = cache(async ({
  page = 1,
  search = "",
  category = "",
  isMobile = true,
}: {
  page?: number;
  search?: string;
  category?: string;
  isMobile?: boolean;
  isPreview?: boolean;
}): Promise<any> => {

  const limit = isMobile
    ? Config.article.pageSize.mobile
    : Config.article.pageSize.desktop;

  const skipMultiplier = (page === 1) ? 0 : page - 1;
  const skip = skipMultiplier > 0 ? limit * skipMultiplier : 0;

  const result = await getArticlesBase({
    limit,
    skip,
    search,
    category,
  });

  return result?.articleCollection;
});

export const getAllArticles = cache(async ({
  search = "",
  category = "",
}: {
  search?: string;
  category?: string;
  isPreview?: boolean;
}): Promise<any> => {

  const result = await getArticlesBase({
    search,
    category,
  });

  return result?.articleCollection;
});

export const getArticleSlugs = cache(async (): Promise<any> => {

  await new Promise(resolve => setTimeout(resolve, 50));

  return {
    items: DUMMY_ARTICLES.map(article => ({ slug: article.slug }))
  };
});

export const getArticleBySlug = cache(async ({
  slug = "",
}: {
  slug: string;
  isPreview?: boolean;
}): Promise<any> => {

  await new Promise(resolve => setTimeout(resolve, 100));

  const article = DUMMY_ARTICLES.find(a => a.slug === slug);

  return {
    data: article || null,
    total: article ? 1 : 0
  };
});

export const getRelatedArticles = cache(async ({
  currentSlug,
  category,
  limit = 4
}: {
  currentSlug: string;
  category?: string;
  tags?: string[];
  totalArticles?: number;
  limit?: number;
}): Promise<any> => {

  await new Promise(resolve => setTimeout(resolve, 100));

  // Filter out current article and prioritize same category
  const related = DUMMY_ARTICLES
    .filter(article => article.slug !== currentSlug)
    .sort((a, b) => {
      // Prioritize same category
      if (category) {
        const aMatch = a.category === category ? 1 : 0;
        const bMatch = b.category === category ? 1 : 0;
        if (aMatch !== bMatch) return bMatch - aMatch;
      }
      return 0;
    })
    .slice(0, limit);

  return related;
});

// =============================================================================
// JSON-LD FUNCTIONS (unchanged from real service)
// =============================================================================

const getArticleJsonLd = (item: any): SchemaArticle => {
  return {
    "@type": "Article",
    headline: item?.metaTitle || item?.title,
    description: item?.metaDescription || item?.excerpt,
    image: item?.coverImage?.url,
    datePublished: item?.date,
    dateModified: item?.sys?.publishedAt,
    author: {
      "@type": "Person",
      name: item?.author,
    } as Person,
    publisher: {
      "@type": "Organization",
      name: "Ulama Moris",
      logo: {
        "@type": "ImageObject",
        url: "https://ulama-moris.org/logo.webp"
      }
    }
  } as SchemaArticle;
};

export const createArticleListJsonLd = (data: any) => {
  const JsonLd: WithContext<ItemList> = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Islamic Articles",
    itemListElement: data?.map((item: any, index: number) => {
      return {
        "@type": "ListItem",
        position: index + 1,
        item: getArticleJsonLd(item)
      };
    })
  };

  return JsonLd;
};

export const createArticleJsonLd = (data: any) => {
  return getArticleJsonLd(data);
};

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

export const CATEGORIES = [
  "Education",
  "Fundamentals",
  "Aqeedah",
  "Seerah",
  "Worship",
  "Family",
  "Spirituality",
  "Fiqh"
];

export { DUMMY_ARTICLES };
