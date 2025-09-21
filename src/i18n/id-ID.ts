/**
 * Indonesian (Bahasa Indonesia) translations
 * Comprehensive translations for the wedding website with cultural context
 */

export interface WeddingTranslations {
  // Common terms
  common: {
    loading: string;
    error: string;
    retry: string;
    save: string;
    cancel: string;
    submit: string;
    close: string;
    next: string;
    previous: string;
    continue: string;
    back: string;
    yes: string;
    no: string;
    maybe: string;
    required: string;
    optional: string;
    email: string;
    phone: string;
    name: string;
    address: string;
    message: string;
    date: string;
    time: string;
    location: string;
    quantity: string;
    guests: string;
  };

  // Wedding-specific terms
  wedding: {
    bride: string;
    groom: string;
    couple: string;
    ceremony: string;
    reception: string;
    wedding: string;
    marriage: string;
    invitation: string;
    celebration: string;
    blessing: string;
    unity: string;
    love: string;
    happiness: string;
    honor: string;
    respect: string;
  };

  // Navigation
  navigation: {
    home: string;
    story: string;
    details: string;
    gallery: string;
    rsvp: string;
    contact: string;
    gifts: string;
    wishes: string;
    accommodation: string;
    transportation: string;
    schedule: string;
  };

  // RSVP Section
  rsvp: {
    title: string;
    subtitle: string;
    form: {
      fullName: string;
      email: string;
      phone: string;
      attendance: string;
      attendingYes: string;
      attendingNo: string;
      attendingMaybe: string;
      guestCount: string;
      guestCountPlaceholder: string;
      dietaryRequirements: string;
      dietaryPlaceholder: string;
      specialRequests: string;
      specialRequestsPlaceholder: string;
      transportation: string;
      transportationOptions: {
        ownVehicle: string;
        shuttle: string;
        publicTransport: string;
        taxi: string;
      };
      accommodation: string;
      accommodationYes: string;
      accommodationNo: string;
      message: string;
      messagePlaceholder: string;
    };
    confirmation: {
      title: string;
      message: string;
      emailSent: string;
      thankYou: string;
    };
    errors: {
      nameRequired: string;
      emailRequired: string;
      emailInvalid: string;
      phoneRequired: string;
      phoneInvalid: string;
      attendanceRequired: string;
      guestCountRequired: string;
      guestCountMin: string;
      guestCountMax: string;
      submissionFailed: string;
      networkError: string;
    };
  };

  // Photo Gallery
  gallery: {
    title: string;
    subtitle: string;
    upload: {
      title: string;
      subtitle: string;
      dragAndDrop: string;
      selectFiles: string;
      takePhoto: string;
      maxFiles: string;
      maxSize: string;
      supportedFormats: string;
      uploading: string;
      uploaded: string;
      failed: string;
      retry: string;
    };
    categories: {
      ceremony: string;
      reception: string;
      prewedding: string;
      family: string;
      friends: string;
      candid: string;
      traditional: string;
    };
  };

  // Contact Information
  contact: {
    title: string;
    subtitle: string;
    bride: {
      title: string;
      name: string;
      family: string;
      phone: string;
      whatsapp: string;
    };
    groom: {
      title: string;
      name: string;
      family: string;
      phone: string;
      whatsapp: string;
    };
    families: {
      title: string;
      brideFamily: string;
      groomFamily: string;
    };
  };

  // Wedding Details
  details: {
    title: string;
    subtitle: string;
    ceremony: {
      title: string;
      date: string;
      time: string;
      location: string;
      address: string;
      description: string;
    };
    reception: {
      title: string;
      date: string;
      time: string;
      location: string;
      address: string;
      description: string;
    };
    dressCode: {
      title: string;
      description: string;
      colors: string;
      suggestions: string[];
      avoid: string[];
    };
    schedule: {
      title: string;
      events: {
        arrival: string;
        ceremony: string;
        photos: string;
        dinner: string;
        entertainment: string;
        closing: string;
      };
    };
  };

  // Gift Registry
  gifts: {
    title: string;
    subtitle: string;
    description: string;
    bankAccounts: {
      title: string;
      bride: string;
      groom: string;
    };
    physicalGifts: {
      title: string;
      description: string;
      address: string;
    };
    gratitude: string;
  };

  // Wedding Story
  story: {
    title: string;
    subtitle: string;
    chapters: {
      meeting: {
        title: string;
        content: string;
      };
      dating: {
        title: string;
        content: string;
      };
      proposal: {
        title: string;
        content: string;
      };
      planning: {
        title: string;
        content: string;
      };
    };
  };

  // Guest Wishes
  wishes: {
    title: string;
    subtitle: string;
    form: {
      name: string;
      message: string;
      messagePlaceholder: string;
      submit: string;
    };
    responses: {
      thankYou: string;
      pending: string;
      approved: string;
    };
    display: {
      from: string;
      anonymous: string;
      showMore: string;
      showLess: string;
    };
  };

  // PWA and Mobile
  mobile: {
    install: {
      title: string;
      subtitle: string;
      benefits: string[];
      install: string;
      later: string;
      never: string;
    };
    offline: {
      title: string;
      message: string;
      queue: string;
      retry: string;
    };
    network: {
      slow: string;
      fast: string;
      offline: string;
      optimizing: string;
      dataSaver: string;
    };
  };

  // Indonesian Cultural Context
  cultural: {
    greetings: {
      morning: string;
      afternoon: string;
      evening: string;
      formal: string;
    };
    blessings: {
      wedding: string[];
      happiness: string[];
      prosperity: string[];
    };
    traditions: {
      siraman: string;
      midodareni: string;
      ijabKabul: string;
      sungkeman: string;
      reception: string;
    };
    islamicTerms: {
      bismillah: string;
      inshaAllah: string;
      mashaAllah: string;
      barakallahu: string;
      ameen: string;
    };
  };

  // Location-specific (Jakarta)
  jakarta: {
    areas: {
      title: string;
      centralJakarta: string;
      southJakarta: string;
      northJakarta: string;
      eastJakarta: string;
      westJakarta: string;
    };
    transportation: {
      title: string;
      mrt: string;
      transjakarta: string;
      taxi: string;
      motorcycle: string;
      car: string;
      walking: string;
    };
    traffic: {
      peakHours: string;
      normalHours: string;
      suggestions: string[];
    };
  };

  // Time and Date Formatting
  time: {
    months: string[];
    days: string[];
    timeFormat: string;
    dateFormat: string;
    wib: string; // Western Indonesia Time
    wita: string; // Central Indonesia Time
    wit: string; // Eastern Indonesia Time
  };

  // Notifications and Messages
  notifications: {
    success: {
      rsvpSubmitted: string;
      photoUploaded: string;
      messagePosted: string;
    };
    errors: {
      networkError: string;
      serverError: string;
      validationError: string;
      uploadError: string;
    };
    warnings: {
      slowConnection: string;
      offlineMode: string;
      dataUsage: string;
      batteryLow: string;
    };
  };

  // Accessibility
  accessibility: {
    skipToContent: string;
    openMenu: string;
    closeMenu: string;
    playVideo: string;
    pauseVideo: string;
    nextImage: string;
    previousImage: string;
    zoomIn: string;
    zoomOut: string;
  };
}

export const indonesianTranslations: WeddingTranslations = {
  common: {
    loading: 'Memuat...',
    error: 'Terjadi kesalahan',
    retry: 'Coba lagi',
    save: 'Simpan',
    cancel: 'Batal',
    submit: 'Kirim',
    close: 'Tutup',
    next: 'Selanjutnya',
    previous: 'Sebelumnya',
    continue: 'Lanjutkan',
    back: 'Kembali',
    yes: 'Ya',
    no: 'Tidak',
    maybe: 'Mungkin',
    required: 'Wajib diisi',
    optional: 'Opsional',
    email: 'Email',
    phone: 'Nomor telepon',
    name: 'Nama',
    address: 'Alamat',
    message: 'Pesan',
    date: 'Tanggal',
    time: 'Waktu',
    location: 'Lokasi',
    quantity: 'Jumlah',
    guests: 'Tamu',
  },

  wedding: {
    bride: 'Pengantin Wanita',
    groom: 'Pengantin Pria',
    couple: 'Pasangan Pengantin',
    ceremony: 'Akad Nikah',
    reception: 'Resepsi',
    wedding: 'Pernikahan',
    marriage: 'Perkawinan',
    invitation: 'Undangan',
    celebration: 'Perayaan',
    blessing: 'Berkat',
    unity: 'Persatuan',
    love: 'Cinta',
    happiness: 'Kebahagiaan',
    honor: 'Kehormatan',
    respect: 'Penghormatan',
  },

  navigation: {
    home: 'Beranda',
    story: 'Kisah Kami',
    details: 'Detail Acara',
    gallery: 'Galeri Foto',
    rsvp: 'Konfirmasi Kehadiran',
    contact: 'Kontak',
    gifts: 'Kado & Hadiah',
    wishes: 'Ucapan & Doa',
    accommodation: 'Akomodasi',
    transportation: 'Transportasi',
    schedule: 'Jadwal Acara',
  },

  rsvp: {
    title: 'Konfirmasi Kehadiran',
    subtitle: 'Mohon konfirmasi kehadiran Anda pada acara pernikahan kami',
    form: {
      fullName: 'Nama Lengkap',
      email: 'Alamat Email',
      phone: 'Nomor WhatsApp',
      attendance: 'Kehadiran',
      attendingYes: 'Hadir',
      attendingNo: 'Tidak Hadir',
      attendingMaybe: 'Masih Ragu',
      guestCount: 'Jumlah Tamu',
      guestCountPlaceholder: 'Berapa orang yang akan hadir?',
      dietaryRequirements: 'Pantangan Makanan',
      dietaryPlaceholder: 'Halal, vegetarian, alergi, dll.',
      specialRequests: 'Permintaan Khusus',
      specialRequestsPlaceholder: 'Kursi roda, tempat duduk khusus, dll.',
      transportation: 'Transportasi',
      transportationOptions: {
        ownVehicle: 'Kendaraan Pribadi',
        shuttle: 'Shuttle yang Disediakan',
        publicTransport: 'Transportasi Umum',
        taxi: 'Taxi/Online',
      },
      accommodation: 'Memerlukan Akomodasi',
      accommodationYes: 'Ya, saya memerlukan bantuan akomodasi',
      accommodationNo: 'Tidak, terima kasih',
      message: 'Pesan untuk Pengantin',
      messagePlaceholder: 'Ucapan selamat, doa, atau pesan khusus...',
    },
    confirmation: {
      title: 'Terima Kasih!',
      message: 'Konfirmasi kehadiran Anda telah berhasil dikirim',
      emailSent: 'Email konfirmasi telah dikirim ke alamat email Anda',
      thankYou: 'Kami sangat menantikan kehadiran Anda dalam acara bahagia ini',
    },
    errors: {
      nameRequired: 'Nama lengkap wajib diisi',
      emailRequired: 'Alamat email wajib diisi',
      emailInvalid: 'Format email tidak valid',
      phoneRequired: 'Nomor telepon wajib diisi',
      phoneInvalid: 'Format nomor telepon tidak valid',
      attendanceRequired: 'Mohon pilih status kehadiran',
      guestCountRequired: 'Jumlah tamu wajib diisi',
      guestCountMin: 'Minimal 1 orang',
      guestCountMax: 'Maksimal 10 orang per undangan',
      submissionFailed: 'Gagal mengirim konfirmasi. Silakan coba lagi.',
      networkError: 'Tidak ada koneksi internet. Data akan tersimpan dan dikirim otomatis saat terhubung.',
    },
  },

  gallery: {
    title: 'Galeri Foto',
    subtitle: 'Berbagi momen indah bersama kami',
    upload: {
      title: 'Upload Foto',
      subtitle: 'Bagikan foto-foto indah dari acara kami',
      dragAndDrop: 'Klik atau seret foto ke sini',
      selectFiles: 'Pilih dari Galeri',
      takePhoto: 'Ambil Foto',
      maxFiles: 'Maksimal 10 foto',
      maxSize: '10MB per foto',
      supportedFormats: 'Format: JPEG, PNG, WebP, HEIC',
      uploading: 'Mengunggah foto...',
      uploaded: 'Foto berhasil diunggah!',
      failed: 'Gagal mengunggah foto',
      retry: 'Coba lagi',
    },
    categories: {
      ceremony: 'Akad Nikah',
      reception: 'Resepsi',
      prewedding: 'Prewedding',
      family: 'Keluarga',
      friends: 'Teman-teman',
      candid: 'Candid',
      traditional: 'Adat Tradisional',
    },
  },

  contact: {
    title: 'Kontak',
    subtitle: 'Hubungi kami untuk informasi lebih lanjut',
    bride: {
      title: 'Pengantin Wanita',
      name: 'Alfina',
      family: 'Keluarga Besar Alfina',
      phone: 'Telepon',
      whatsapp: 'WhatsApp',
    },
    groom: {
      title: 'Pengantin Pria',
      name: 'Mugni',
      family: 'Keluarga Besar Mugni',
      phone: 'Telepon',
      whatsapp: 'WhatsApp',
    },
    families: {
      title: 'Keluarga Besar',
      brideFamily: 'Keluarga Mempelai Wanita',
      groomFamily: 'Keluarga Mempelai Pria',
    },
  },

  details: {
    title: 'Detail Acara',
    subtitle: 'Informasi lengkap mengenai rangkaian acara pernikahan',
    ceremony: {
      title: 'Akad Nikah',
      date: '29 November 2025',
      time: '08:00 WIB',
      location: 'Masjid Istiqlal',
      address: 'Jl. Taman Wijaya Kusuma, Jakarta Pusat',
      description: 'Upacara pernikahan religius yang mengikat kedua mempelai dalam ikatan suci pernikahan',
    },
    reception: {
      title: 'Resepsi Pernikahan',
      date: '29 November 2025',
      time: '18:00 - 21:00 WIB',
      location: 'Jakarta Convention Center',
      address: 'Jl. Gatot Subroto, Jakarta Pusat',
      description: 'Perayaan kebahagiaan bersama keluarga, sahabat, dan orang-orang terkasih',
    },
    dressCode: {
      title: 'Dress Code',
      description: 'Kami sangat menghargai jika Anda berkenan mengenakan pakaian dengan nuansa warna berikut:',
      colors: 'Warna yang Disarankan',
      suggestions: [
        'Coklat Muda (Cream/Beige)',
        'Hijau Sage',
        'Lavender',
        'Abu-abu Muda',
        'Putih Gading',
      ],
      avoid: [
        'Putih murni (reserved untuk pengantin)',
        'Hitam total',
        'Warna neon yang terlalu mencolok',
      ],
    },
    schedule: {
      title: 'Jadwal Acara',
      events: {
        arrival: 'Kedatangan Tamu',
        ceremony: 'Akad Nikah',
        photos: 'Sesi Foto Bersama',
        dinner: 'Makan Malam',
        entertainment: 'Hiburan',
        closing: 'Penutupan',
      },
    },
  },

  gifts: {
    title: 'Kado & Hadiah',
    subtitle: 'Doa dan restu Anda adalah hadiah terindah bagi kami',
    description: 'Kehadiran Anda dalam acara bahagia kami sudah merupakan hadiah yang sangat berharga. Namun jika Anda berkenan memberikan hadiah, berikut adalah beberapa cara:',
    bankAccounts: {
      title: 'Transfer Bank',
      bride: 'Rekening Mempelai Wanita',
      groom: 'Rekening Mempelai Pria',
    },
    physicalGifts: {
      title: 'Hadiah Fisik',
      description: 'Hadiah fisik dapat dikirim ke alamat berikut:',
      address: 'Alamat Pengiriman Hadiah',
    },
    gratitude: 'Terima kasih atas segala bentuk doa, restu, dan hadiah yang Anda berikan. Semoga Allah SWT membalas kebaikan Anda.',
  },

  story: {
    title: 'Kisah Cinta Kami',
    subtitle: 'Perjalanan indah menuju pelaminan',
    chapters: {
      meeting: {
        title: 'Pertemuan Pertama',
        content: 'Takdir mempertemukan kami di tempat yang tak pernah kami sangka. Dalam kesederhanaan pertemuan itu, Allah telah menuliskan permulaan kisah cinta yang indah.',
      },
      dating: {
        title: 'Masa Taaruf',
        content: 'Dalam proses saling mengenal, kami belajar memahami satu sama lain. Setiap percakapan memperkuat keyakinan bahwa kami diciptakan untuk saling melengkapi.',
      },
      proposal: {
        title: 'Lamaran',
        content: 'Dengan restu kedua orang tua dan doa yang tulus, momen sakral lamaran menjadi langkah awal menuju kehidupan baru yang penuh berkah.',
      },
      planning: {
        title: 'Persiapan Pernikahan',
        content: 'Bersama keluarga dan orang-orang terkasih, kami mempersiapkan hari bahagia yang akan menjadi awal dari perjalanan hidup baru sebagai suami istri.',
      },
    },
  },

  wishes: {
    title: 'Ucapan & Doa',
    subtitle: 'Tinggalkan ucapan selamat dan doa terbaik untuk kami',
    form: {
      name: 'Nama Anda',
      message: 'Ucapan & Doa',
      messagePlaceholder: 'Tuliskan ucapan selamat, doa, atau pesan indah untuk kami...',
      submit: 'Kirim Ucapan',
    },
    responses: {
      thankYou: 'Terima kasih atas ucapan dan doa yang indah!',
      pending: 'Ucapan Anda sedang dalam proses moderasi',
      approved: 'Ucapan Anda telah dipublikasikan',
    },
    display: {
      from: 'dari',
      anonymous: 'Anonim',
      showMore: 'Lihat lebih banyak',
      showLess: 'Lihat lebih sedikit',
    },
  },

  mobile: {
    install: {
      title: 'Pasang Aplikasi Wedding',
      subtitle: 'Dapatkan akses cepat ke semua informasi pernikahan',
      benefits: [
        'Akses langsung dari layar utama',
        'Loading lebih cepat dan hemat data',
        'RSVP tetap tersimpan saat offline',
        'Upload foto langsung dari kamera',
        'Notifikasi update acara pernikahan',
      ],
      install: 'Pasang Aplikasi',
      later: 'Nanti saja',
      never: 'Jangan tampilkan lagi',
    },
    offline: {
      title: 'Mode Offline',
      message: 'Anda sedang offline. Data akan tersimpan dan dikirim otomatis saat terhubung kembali.',
      queue: 'pesan dalam antrian',
      retry: 'Coba sambung kembali',
    },
    network: {
      slow: 'Koneksi lambat - Mengoptimalkan untuk jaringan',
      fast: 'Koneksi baik',
      offline: 'Offline',
      optimizing: 'Mengoptimalkan untuk jaringan Indonesia...',
      dataSaver: 'Mode hemat data aktif',
    },
  },

  cultural: {
    greetings: {
      morning: 'Selamat pagi',
      afternoon: 'Selamat siang',
      evening: 'Selamat malam',
      formal: 'Assalamu\'alaikum warahmatullahi wabarakatuh',
    },
    blessings: {
      wedding: [
        'Barakallahu lakuma wa baraka \'alaikuma wa jama\'a bainakuma fi khair',
        'Semoga Allah memberikan berkah bagi kalian berdua dan menyatukan kalian dalam kebaikan',
        'Semoga menjadi keluarga yang sakinah, mawaddah, warahmah',
      ],
      happiness: [
        'Semoga bahagia dunia akhirat',
        'Semoga langgeng hingga kakek nenek',
        'Semoga cepat diberi momongan',
      ],
      prosperity: [
        'Semoga diberkahi rezeki yang halal dan melimpah',
        'Semoga dimudahkan segala urusan',
        'Semoga menjadi keluarga yang penuh berkah',
      ],
    },
    traditions: {
      siraman: 'Siraman - Ritual mandi pengantin sebagai simbol penyucian diri',
      midodareni: 'Midodareni - Malam sebelum akad nikah, pengantin wanita berdoa dan mempersiapkan diri',
      ijabKabul: 'Ijab Kabul - Akad nikah yang mengikat kedua mempelai secara sah',
      sungkeman: 'Sungkeman - Penghormatan dan meminta restu kepada orang tua',
      reception: 'Resepsi - Perayaan kebahagiaan bersama keluarga dan kerabat',
    },
    islamicTerms: {
      bismillah: 'Bismillahirrahmanirrahim - Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang',
      inshaAllah: 'Insya Allah - Jika Allah berkehendak',
      mashaAllah: 'Masha Allah - Apa yang Allah kehendaki',
      barakallahu: 'Barakallahu - Semoga Allah memberkahi',
      ameen: 'Aamiin - Kabulkanlah (doa)',
    },
  },

  jakarta: {
    areas: {
      title: 'Wilayah Jakarta',
      centralJakarta: 'Jakarta Pusat',
      southJakarta: 'Jakarta Selatan',
      northJakarta: 'Jakarta Utara',
      eastJakarta: 'Jakarta Timur',
      westJakarta: 'Jakarta Barat',
    },
    transportation: {
      title: 'Transportasi',
      mrt: 'MRT Jakarta',
      transjakarta: 'TransJakarta',
      taxi: 'Taksi',
      motorcycle: 'Ojek Online',
      car: 'Mobil Pribadi',
      walking: 'Jalan Kaki',
    },
    traffic: {
      peakHours: 'Jam Sibuk (07:00-09:00 & 17:00-19:00)',
      normalHours: 'Jam Normal',
      suggestions: [
        'Gunakan transportasi umum saat jam sibuk',
        'Berangkat lebih awal untuk menghindari kemacetan',
        'Gunakan aplikasi navigasi untuk rute terbaik',
        'Pertimbangkan menginap di hotel terdekat',
      ],
    },
  },

  time: {
    months: [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ],
    days: [
      'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
    ],
    timeFormat: 'HH:mm',
    dateFormat: 'DD MMMM YYYY',
    wib: 'WIB (Waktu Indonesia Barat)',
    wita: 'WITA (Waktu Indonesia Tengah)',
    wit: 'WIT (Waktu Indonesia Timur)',
  },

  notifications: {
    success: {
      rsvpSubmitted: 'Konfirmasi kehadiran berhasil dikirim!',
      photoUploaded: 'Foto berhasil diunggah!',
      messagePosted: 'Ucapan berhasil dipublikasikan!',
    },
    errors: {
      networkError: 'Tidak ada koneksi internet. Silakan coba lagi.',
      serverError: 'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.',
      validationError: 'Mohon periksa kembali data yang Anda masukkan.',
      uploadError: 'Gagal mengunggah file. Silakan coba lagi.',
    },
    warnings: {
      slowConnection: 'Koneksi internet lambat. Gambar akan dioptimalkan.',
      offlineMode: 'Anda sedang offline. Data akan tersimpan secara lokal.',
      dataUsage: 'Penggunaan data sudah mencapai 80% dari limit harian.',
      batteryLow: 'Baterai rendah. Mode hemat daya telah diaktifkan.',
    },
  },

  accessibility: {
    skipToContent: 'Langsung ke konten',
    openMenu: 'Buka menu',
    closeMenu: 'Tutup menu',
    playVideo: 'Putar video',
    pauseVideo: 'Jeda video',
    nextImage: 'Gambar selanjutnya',
    previousImage: 'Gambar sebelumnya',
    zoomIn: 'Perbesar',
    zoomOut: 'Perkecil',
  },
};

// Utility function to get translation by key path
export function getTranslation(keyPath: string, fallback?: string): string {
  const keys = keyPath.split('.');
  let current: any = indonesianTranslations;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      console.warn(`Translation key not found: ${keyPath}`);
      return fallback || keyPath;
    }
  }

  return typeof current === 'string' ? current : fallback || keyPath;
}

// Hook for easy translation access in components
export function useTranslation() {
  return {
    t: getTranslation,
    translations: indonesianTranslations,
  };
}

// Format Indonesian date
export function formatIndonesianDate(date: Date, includeTime = false): string {
  const months = indonesianTranslations.time.months;
  const days = indonesianTranslations.time.days;

  const day = days[date.getDay()];
  const dateNum = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  let formatted = `${day}, ${dateNum} ${month} ${year}`;

  if (includeTime) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    formatted += ` ${hours}:${minutes} WIB`;
  }

  return formatted;
}

// Format Indonesian currency (Rupiah)
export function formatIndonesianCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default indonesianTranslations;