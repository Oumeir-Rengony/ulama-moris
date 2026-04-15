export interface AudioItem {
  id: string
  title: string
  description: string
  speaker: string
  masjid?: string
  date: string
  audioSrc: string
  category: "local" | "international"
}

// Audio data from Ulama Moris
export const audioItems: AudioItem[] = [
  {
    id: "1",
    title: "16 Benefits of Taqwa from Qur'an",
    description:
      "An enlightening lecture exploring the sixteen blessings and benefits that Allah promises to those who adopt Taqwa (God-consciousness) as mentioned in the Holy Quran.",
    speaker: "Mufti Houzeifa Mamoojee",
    masjid: "Masjid Al Qiblah, Beau Bassin",
    date: "15 March 2026",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    category: "international",
  },
  {
    id: "2",
    title: "Before Islam and the Revelation of Ramadan",
    description:
      "A historical perspective on the pre-Islamic era and the divine revelation of fasting in Ramadan, exploring its spiritual significance.",
    speaker: "Mawlana Shabiir Soobhun",
    masjid: "Masjid Noor Ud Deen, Cassis",
    date: "15 February 2026",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    category: "local",
  },
  {
    id: "3",
    title: "The Moon Controversy Surrounding Ramadan",
    description:
      "Explanation on moon calculation versus sighting, witness testimony and who has the authority to declare Ramadan or Eid and the criteria for a unified sighting.",
    speaker: "Mufti Houzeifa Mamoojee",
    masjid: "Masjid Malartic, Curepipe",
    date: "07 February 2026",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    category: "local",
  },
  {
    id: "4",
    title: "The Night of 15th Sha'ban",
    description:
      "Who are the people who will not receive the blessing tonight? A detailed explanation of this blessed night and how to maximize its benefits.",
    speaker: "Mawlana Imtiyaz Ahmad Kurrimbux",
    masjid: "Masjid Shaan-e-Muhammad, Triolet",
    date: "30 January 2026",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    category: "local",
  },
  {
    id: "5",
    title: "Can Muslims Celebrate Christmas & New Year",
    description:
      "An important discussion on the Islamic perspective regarding participation in non-Islamic religious celebrations and cultural festivities.",
    speaker: "Mawlana Shabiir Soobhun",
    date: "19 December 2025",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    category: "local",
  },
  {
    id: "6",
    title: "The Gravity of Riba: A Warning on the Sin of Interest",
    description:
      "Spiritual War: The Quran describes engaging in Riba as being in a state of war with Allah and His Messenger (s.a.w). This is the only sin given such a severe warning.",
    speaker: "Mawlana Iklas Timol",
    masjid: "Madrassah Taleemul Islaam",
    date: "13 December 2025",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    category: "local",
  },
  {
    id: "7",
    title: "Choose Your Circle (Friends) Wisely",
    description:
      "The importance of surrounding yourself with righteous companions and how your friends influence your character and faith.",
    speaker: "Mawlana Shabir Soubhun",
    masjid: "Madrassah Taleemul Islaam",
    date: "13 December 2025",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    category: "local",
  },
  {
    id: "8",
    title: "Rebuilding this Ummah",
    description:
      "The Muslim world today faces an Ummah in crisis. There are five essential values that an Ummah should embody, and despite the immense suffering, Gaza stands as a living example.",
    speaker: "Mufti Houzeifa Mamoojee",
    masjid: "Ad Dawa Al Islamiah Masjid, Mare Gravier",
    date: "14 November 2025",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    category: "local",
  },
  {
    id: "9",
    title: "The Importance of Salah in Daily Life",
    description:
      "Understanding how the five daily prayers form the foundation of a Muslim's spiritual journey and connection with Allah.",
    speaker: "Mufti Houzeifa Mamoojee",
    masjid: "Masjid Al Qiblah, Beau Bassin",
    date: "10 November 2025",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    category: "local",
  },
  {
    id: "10",
    title: "Understanding Surah Al-Fatiha",
    description:
      "A deep dive into the opening chapter of the Quran, exploring its meanings, virtues, and the wisdom behind its placement in every prayer.",
    speaker: "Mawlana Imtiyaz Ahmad Kurrimbux",
    masjid: "Masjid Noor Ud Deen, Cassis",
    date: "05 November 2025",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    category: "local",
  },
  {
    id: "11",
    title: "The Story of Prophet Yusuf (AS)",
    description:
      "Lessons from the best of stories as described by Allah in the Quran - the life of Prophet Yusuf and his journey from the well to the throne.",
    speaker: "Mawlana Shabiir Soobhun",
    masjid: "Masjid Malartic, Curepipe",
    date: "28 October 2025",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    category: "international",
  },
  {
    id: "12",
    title: "Marriage in Islam: Rights and Responsibilities",
    description:
      "A comprehensive guide to the Islamic principles of marriage, covering the rights of spouses and building a harmonious household.",
    speaker: "Mufti Houzeifa Mamoojee",
    masjid: "Ad Dawa Al Islamiah Masjid, Mare Gravier",
    date: "20 October 2025",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    category: "local",
  },
  {
    id: "13",
    title: "The Signs of the Last Day",
    description:
      "Exploring the major and minor signs of the Day of Judgment as described in authentic hadith and what they mean for believers today.",
    speaker: "Mawlana Iklas Timol",
    masjid: "Madrassah Taleemul Islaam",
    date: "15 October 2025",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    category: "international",
  },
  {
    id: "14",
    title: "Purification of the Heart",
    description:
      "Understanding the diseases of the heart mentioned in Islamic tradition and the spiritual remedies prescribed by scholars.",
    speaker: "Mawlana Shabir Soubhun",
    masjid: "Masjid Shaan-e-Muhammad, Triolet",
    date: "08 October 2025",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    category: "local",
  },
  {
    id: "15",
    title: "The Life of Khadijah (RA)",
    description:
      "The inspiring story of the Mother of Believers, her sacrifices for Islam, and her unparalleled support for the Prophet (SAW).",
    speaker: "Mawlana Imtiyaz Ahmad Kurrimbux",
    masjid: "Masjid Al Qiblah, Beau Bassin",
    date: "01 October 2025",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    category: "international",
  },
  {
    id: "16",
    title: "Virtues of Dhikr",
    description:
      "The power of remembrance of Allah and how consistent dhikr transforms the heart and brings peace to the soul.",
    speaker: "Mufti Houzeifa Mamoojee",
    masjid: "Masjid Noor Ud Deen, Cassis",
    date: "25 September 2025",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
    category: "local",
  },
]