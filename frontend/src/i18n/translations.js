// Centralized translation system for the entire app
// Supports: EN (English), AR (Arabic), ES (Spanish)

export const translations = {
  EN: {
    // Common
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      back: 'Back',
      next: 'Next',
      done: 'Done',
      confirm: 'Confirm',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      username: 'Username',
      password: 'Password',
      email: 'Email',
      name: 'Name',
      submit: 'Submit',
    },

    // Auth
    auth: {
      login: 'Log in',
      signup: 'Sign up',
      logout: 'Logout',
      loginTitle: 'Welcome back',
      loginSubtitle: 'Enter your credentials to continue',
      signupTitle: 'Create account',
      signupSubtitle: 'Join our anonymous community',
      forgotPassword: 'Forgot password?',
      rememberMe: 'Remember me',
      secretPhrase: 'Secret phrase',
      secretAnswer: 'Secret answer',
      createAccount: 'Create account',
      haveAccount: 'Already have an account?',
      noAccount: "Don't have an account?",
      recoverTitle: 'Recover account',
      recoverSubtitle: 'Enter your username to recover',
      recoverButton: 'Recover',
      backToLogin: 'Back to login',
      loginSuccess: 'Logged in successfully',
      signupSuccess: 'Account created successfully',
      logoutSuccess: 'Logged out successfully',
      invalidCredentials: 'Invalid credentials',
      userExists: 'User already exists',
      sessionExpired: 'Session expired. Please login again',
      notAuthenticated: 'Please login to continue',
    },

    // Navigation
    nav: {
      home: 'Home',
      links: 'Links',
      search: 'Search',
      messages: 'Messages',
      profile: 'Profile',
      settings: 'Settings',
    },

    // Profile
    profile: {
      eyebrow: 'Profile',
      title: 'Your anonymous hub',
      subtitle: 'Manage your identity, links, and friendships in one place.',
      editProfile: 'Edit profile',
      viewLinks: 'View links',
      viewMessages: 'Messages',
      guestTitle: 'Guest Mode',
      guestSubtitle: 'Login or signup to save your data and access more features.',
      copyUrl: 'Copy profile URL',
      profileUrl: 'Profile URL:',
      copied: 'Copied!',
      copy: 'Copy',
    },

    // User Profile
    userProfile: {
      back: '← Back',
      sendAnonymous: 'Send Anonymous Message',
      sendPlaceholder: 'Write an anonymous note...',
      sendCta: 'Send message',
      sent: 'Message sent',
      emptyError: 'Message cannot be empty',
      follow: 'Follow',
      unfollow: 'Unfollow',
      following: 'Following',
      loginToFollow: 'Login to follow',
      publicMessages: 'Public Messages',
      noMessages: 'No public messages yet',
      noName: 'No name provided',
      shareUrl: 'Share URL:',
      error: 'Unable to load profile',
    },

    // Home
    home: {
      eyebrow: 'Feed',
      title: 'Your following',
      subtitle: 'Stay connected with the people you follow',
      emptyTitle: 'Create your community',
      emptySubtitle: 'Connect with friends, share thoughts, and build your network. Start by creating an account and adding people to follow.',
      getStarted: 'Get Started',
      loadingFollowing: 'Loading your following...',
      noFollowing: 'Not following anyone yet',
    },

    // Search
    search: {
      eyebrow: 'Search',
      title: 'Find people. Send the truth.',
      subtitle: 'Search by username or name, add friends, or send one-time anonymous messages.',
      search: 'Search',
      startText: 'Start Searching',
      startDesc: 'Type a username or name to see matching users.',
      searching: 'Searching...',
      noResults: 'No matches found',
      noResultsDesc: 'Try a different name or check spelling.',
      placeholder: 'Search by username or name...',
      userNotFound: 'User not found',
      searchFailed: 'Search failed',
      loginRequired: 'Login required to follow.',
      alreadyFollowing: 'Already following this user',
      nowFollowing: 'Now following user!',
      unfollowed: 'Unfollowed user',
      couldNotFollow: 'Could not follow user',
      couldNotUnfollow: 'Could not unfollow user',
    },

    // Messages
    messages: {
      eyebrow: 'Inbox',
      title: 'Anonymous messages',
      subtitle: 'Manage messages between inbox, public, and deleted.',
      tabInbox: 'Inbox',
      tabPublic: 'Public',
      tabDeleted: 'Deleted',
      helperInbox: 'Default inbox for incoming anonymous notes.',
      helperPublic: 'Public messages visible on your public profile.',
      helperDeleted: 'Soft-deleted messages (archived).',
      emptyTitle: 'No messages yet',
      emptyText: 'New anonymous notes will appear here. Try switching tabs.',
      anonymous: 'Anonymous',
      anonymousTitle: 'Send anonymous message',
      sent: 'Message sent',
      send: 'Send message',
      messageSingular: 'message',
      messagePlural: 'messages',
      tabs: {
        inbox: 'Inbox',
        public: 'Public',
        deleted: 'Deleted'
      },
      noMessages: 'No messages yet',
      noMessagesText: 'Your message list is empty. Check other tabs or ask others to send you messages!',
      timestampLabel: 'Now',
      makePublic: 'Make Public',
      makePrivate: 'Make Private',
      error: 'Failed to update message',
      success: 'Message updated',
      lockedTitle: 'Messages are locked',
      lockedSubtitle: 'Log in to access your inbox and manage private messages. Create an account to receive permanent messages and connect with others.',
    },

    // Links
    links: {
      eyebrow: 'Links',
      title: 'Temporary links',
      subtitle: 'Create anonymous links and share them.',
      createNew: 'Create new link',
      activeLinks: 'Active links',
      noLinks: 'No active links yet',
      createFirst: 'Create your first link',
      public: 'Public',
      private: 'Private',
      expires: 'Expires',
      views: 'Views',
      delete: 'Delete',
      lockedTitle: 'Links are locked',
      lockedSubtitle: 'Create an account to generate temporary links and share them with others.',
      createLinkTitle: 'Create Link',
      generateTitle: 'Generate Temporary Link',
      generateSubtitle: 'Create anonymous messaging links with expiration',
      displayNameLabel: 'Display Name (optional)',
      displayNamePlaceholder: 'e.g., Anonymous Feedback',
      durationLabel: 'Link Duration',
      duration6h: '6 hours',
      duration12h: '12 hours',
      duration24h: '24 hours',
      duration7d: '1 week',
      duration30d: '1 month',
      guestWarning: 'To create links longer than 24 hours, please log in.',
      createBtn: 'Create Link',
      creating: 'Creating...',
      linksGenerated: 'Links Generated',
      expiresIn: 'Expires in:',
      publicLinkTitle: 'Public Link',
      publicLinkDesc: 'Share this - anyone can send messages',
      privateLinkTitle: 'Private Link (Inbox)',
      privateLinkDesc: 'Your inbox - view received messages',
      copyPublic: 'Copy Public',
      copyPrivate: 'Copy Private',
      copied: '✓ Copied',
      copy: 'Copy',
      viewInbox: 'View Inbox',
      view: 'View',
      myLinksTitle: 'My Links',
      myLinksSubtitle: 'Manage your anonymous messaging links',
      loginToView: 'Log in to view saved links',
      guestLinksWarning: 'Guest-created links are not saved. Sign in to keep and manage your links.',
      noLinksYet: 'No links yet',
      noLinksDesc: 'Create a link above to get started',
      anonymous: 'Anonymous',
      expired: '⏰ Expired',
      permanent: 'Permanent',
      days: 'days',
      hours: 'hours',
      lessThanHour: 'Less than 1 hour',
      created: 'Created',
    },

    // Settings
    settings: {
      title: 'Settings',
      subtitle: 'Manage your account preferences',
      language: 'Language',
      theme: 'Theme',
      notifications: 'Notifications',
      privacy: 'Privacy',
      account: 'Account',
      about: 'About',
      version: 'Version',
      saveChanges: 'Save changes',
      changesSaved: 'Changes saved successfully',
    },

    // Buttons
    buttons: {
      follow: 'Follow',
      following: 'Following',
      unfollow: 'Unfollow',
      login: 'Log in',
      signup: 'Sign up',
      logout: 'Logout',
      send: 'Send',
      cancel: 'Cancel',
      delete: 'Delete',
      save: 'Save',
      edit: 'Edit',
      retry: 'Retry',
      backToHome: '← Back To Home Page',
    },

    // Empty states
    empty: {
      noResults: 'No results found',
      noMessages: 'No messages yet',
      noLinks: 'No links yet',
      noFollowing: 'Not following anyone yet',
      noFollowers: 'No followers yet',
      tryAgain: 'Try again',
    },

    // Errors
    errors: {
      generic: 'Something went wrong',
      network: 'Network error. Please check your connection.',
      notFound: 'Not found',
      unauthorized: 'Unauthorized access',
      sessionExpired: 'Your session has expired',
      tryAgain: 'Please try again',
    },

    // Time
    time: {
      now: 'Now',
      justNow: 'Just now',
      minutesAgo: (n) => `${n}m ago`,
      hoursAgo: (n) => `${n}h ago`,
      daysAgo: (n) => `${n}d ago`,
      weeksAgo: (n) => `${n}w ago`,
    },
  },

  AR: {
    // Common
    common: {
      loading: 'جاري التحميل...',
      error: 'حدث خطأ',
      retry: 'إعادة المحاولة',
      cancel: 'إلغاء',
      save: 'حفظ',
      delete: 'حذف',
      edit: 'تعديل',
      back: 'رجوع',
      next: 'التالي',
      done: 'تم',
      confirm: 'تأكيد',
      search: 'بحث',
      filter: 'تصفية',
      sort: 'ترتيب',
      username: 'اسم المستخدم',
      password: 'كلمة المرور',
      email: 'البريد الإلكتروني',
      name: 'الاسم',
      submit: 'إرسال',
    },

    // Auth
    auth: {
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      logout: 'تسجيل الخروج',
      loginTitle: 'مرحباً بعودتك',
      loginSubtitle: 'أدخل بياناتك للمتابعة',
      signupTitle: 'إنشاء حساب',
      signupSubtitle: 'انضم إلى مجتمعنا المجهول',
      forgotPassword: 'نسيت كلمة المرور؟',
      rememberMe: 'تذكرني',
      secretPhrase: 'العبارة السرية',
      secretAnswer: 'الإجابة السرية',
      createAccount: 'إنشاء حساب',
      haveAccount: 'لديك حساب بالفعل؟',
      noAccount: 'ليس لديك حساب؟',
      recoverTitle: 'استعادة الحساب',
      recoverSubtitle: 'أدخل اسم المستخدم للاستعادة',
      recoverButton: 'استعادة',
      backToLogin: 'العودة لتسجيل الدخول',
      loginSuccess: 'تم تسجيل الدخول بنجاح',
      signupSuccess: 'تم إنشاء الحساب بنجاح',
      logoutSuccess: 'تم تسجيل الخروج بنجاح',
      invalidCredentials: 'بيانات غير صحيحة',
      userExists: 'المستخدم موجود بالفعل',
      sessionExpired: 'انتهت الجلسة. الرجاء تسجيل الدخول مرة أخرى',
      notAuthenticated: 'الرجاء تسجيل الدخول للمتابعة',
    },

    // Navigation
    nav: {
      home: 'الرئيسية',
      links: 'الروابط',
      search: 'بحث',
      messages: 'الرسائل',
      profile: 'الملف الشخصي',
      settings: 'الإعدادات',
    },

    // Profile
    profile: {
      eyebrow: 'الملف الشخصي',
      title: 'مركزك المجهول',
      subtitle: 'إدارة هويتك وروابطك وأصدقائك في مكان واحد.',
      editProfile: 'تعديل الملف',
      viewLinks: 'عرض الروابط',
      viewMessages: 'الرسائل',
      guestTitle: 'وضع الضيف',
      guestSubtitle: 'سجل دخولك أو أنشئ حسابًا لحفظ بياناتك.',
      copyUrl: 'نسخ رابط الملف الشخصي',
      profileUrl: 'رابط الملف الشخصي:',
      copied: 'تم النسخ!',
      copy: 'نسخ',
    },

    // User Profile
    userProfile: {
      back: '← رجوع',
      sendAnonymous: 'إرسال رسالة مجهولة',
      sendPlaceholder: 'اكتب رسالة مجهولة...',
      sendCta: 'إرسال الرسالة',
      sent: 'تم إرسال الرسالة',
      emptyError: 'لا يمكن أن تكون الرسالة فارغة',
      follow: 'متابعة',
      unfollow: 'إلغاء المتابعة',
      following: 'يتابع',
      loginToFollow: 'سجل الدخول للمتابعة',
      publicMessages: 'الرسائل العامة',
      noMessages: 'لا توجد رسائل عامة حتى الآن',
      noName: 'لم يتم توفير اسم',
      shareUrl: 'مشاركة الرابط:',
      error: 'تعذر تحميل الملف الشخصي',
    },

    // Home
    home: {
      eyebrow: 'الخلاصة',
      title: 'المتابَعون',
      subtitle: 'ابقَ على تواصل مع الأشخاص الذين تتابعهم',
      emptyTitle: 'أنشئ مجتمعك',
      emptySubtitle: 'تواصل مع الأصدقاء، شارك الأفكار، وابنِ شبكتك. ابدأ بإنشاء حساب وإضافة أشخاص للمتابعة.',
      getStarted: 'ابدأ الآن',
      loadingFollowing: 'جاري تحميل المتابَعين...',
      noFollowing: 'لا تتابع أحداً بعد',
    },

    // Search
    search: {
      eyebrow: 'بحث',
      title: 'ابحث عن الأصدقاء وأرسل الحقيقة',
      subtitle: 'ابحث باسم المستخدم أو الاسم، أضف أصدقاء، أو أرسل رسائل مجهولة.',
      search: 'بحث',
      startText: 'ابدأ البحث',
      startDesc: 'اكتب اسم مستخدم أو اسم لرؤية المطابقات.',
      searching: 'جاري البحث...',
      noResults: 'لا توجد نتائج',
      noResultsDesc: 'جرب اسماً آخر أو تحقق من الإملاء.',
      placeholder: 'ابحث باسم المستخدم أو الاسم...',
      userNotFound: 'لم يتم العثور على المستخدم',
      searchFailed: 'فشل البحث',
      loginRequired: 'تسجيل الدخول مطلوب للمتابعة.',
      alreadyFollowing: 'تتابع هذا المستخدم بالفعل',
      nowFollowing: 'جاري المتابعة!',
      unfollowed: 'تم إلغاء المتابعة',
      couldNotFollow: 'لا يمكن المتابعة',
      couldNotUnfollow: 'لا يمكن إلغاء المتابعة',
    },

    // Messages
    messages: {
      eyebrow: 'الوارد',
      title: 'رسائل مجهولة',
      subtitle: 'أدر الرسائل بين الوارد والعام والمحذوفة.',
      tabInbox: 'الوارد',
      tabPublic: 'عام',
      tabDeleted: 'محذوفة',
      helperInbox: 'صندوق الوارد الافتراضي للرسائل المجهولة.',
      helperPublic: 'رسائل عامة مرئية في ملفك العام.',
      helperDeleted: 'رسائل محذوفة بشكل مؤقت (مؤرشفة).',
      emptyTitle: 'لا توجد رسائل',
      emptyText: 'ستظهر الملاحظات المجهولة هنا. جرّب تغيير التبويب.',
      anonymous: 'مجهول',
      anonymousTitle: 'إرسال رسالة مجهولة',
      sent: 'تم إرسال الرسالة',
      send: 'إرسال رسالة',
      messageSingular: 'رسالة',
      messagePlural: 'رسائل',
      tabs: {
        inbox: 'الوارد',
        public: 'عام',
        deleted: 'محذوفة'
      },
      noMessages: 'لا توجد رسائل',
      noMessagesText: 'قائمة الرسائل الخاصة بك فارغة. تحقق من علامات تبويب أخرى أو اطلب من الآخرين إرسال رسائل إليك!',
      timestampLabel: 'الآن',
      makePublic: 'اجعله عام',
      makePrivate: 'اجعله خاص',
      error: 'فشل تحديث الرسالة',
      success: 'تم تحديث الرسالة',
      lockedTitle: 'الرسائل مقفلة',
      lockedSubtitle: 'سجل الدخول للوصول إلى صندوق الوارد وإدارة الرسائل الخاصة. أنشئ حساباً لتلقي الرسائل الدائمة والتواصل مع الآخرين.',
    },

    // Links
    links: {
      eyebrow: 'الروابط',
      title: 'روابط مؤقتة',
      subtitle: 'أنشئ روابط مجهولة وشاركها.',
      createNew: 'إنشاء رابط جديد',
      activeLinks: 'الروابط النشطة',
      noLinks: 'لا توجد روابط نشطة بعد',
      createFirst: 'أنشئ أول رابط لك',
      public: 'عام',
      private: 'خاص',
      expires: 'ينتهي',
      views: 'مشاهدات',
      delete: 'حذف',
      lockedTitle: 'الروابط مقفلة',
      lockedSubtitle: 'أنشئ حساباً لإنشاء روابط مؤقتة ومشاركتها مع الآخرين.',
      createLinkTitle: 'إنشاء رابط',
      generateTitle: 'إنشاء رابط مؤقت',
      generateSubtitle: 'أنشئ روابط مراسلة مجهولة مع انتهاء الصلاحية',
      displayNameLabel: 'اسم العرض (اختياري)',
      displayNamePlaceholder: 'مثال: تعليقات مجهولة',
      durationLabel: 'مدة الرابط',
      duration6h: '6 ساعات',
      duration12h: '12 ساعة',
      duration24h: '24 ساعة',
      duration7d: 'أسبوع واحد',
      duration30d: 'شهر واحد',
      guestWarning: 'لإنشاء روابط أطول من 24 ساعة، يرجى تسجيل الدخول.',
      createBtn: 'إنشاء رابط',
      creating: 'جاري الإنشاء...',
      linksGenerated: 'الروابط المُنشأة',
      expiresIn: 'ينتهي في:',
      publicLinkTitle: 'رابط عام',
      publicLinkDesc: 'شارك هذا - يمكن لأي شخص إرسال رسائل',
      privateLinkTitle: 'رابط خاص (البريد الوارد)',
      privateLinkDesc: 'البريد الوارد الخاص بك - عرض الرسائل المستلمة',
      copyPublic: 'نسخ العام',
      copyPrivate: 'نسخ الخاص',
      copied: '✓ تم النسخ',
      copy: 'نسخ',
      viewInbox: 'عرض البريد الوارد',
      view: 'عرض',
      myLinksTitle: 'روابطي',
      myLinksSubtitle: 'إدارة روابط المراسلة المجهولة الخاصة بك',
      loginToView: 'سجل الدخول لعرض الروابط المحفوظة',
      guestLinksWarning: 'لا يتم حفظ الروابط التي أنشأها الضيف. سجّل الدخول للاحتفاظ بروابطك وإدارتها.',
      noLinksYet: 'لا توجد روابط بعد',
      noLinksDesc: 'أنشئ رابطاً أعلاه للبدء',
      anonymous: 'مجهول',
      expired: '⏰ منتهي',
      permanent: 'دائم',
      days: 'أيام',
      hours: 'ساعات',
      lessThanHour: 'أقل من ساعة',
      created: 'تم الإنشاء',
    },

    // Settings
    settings: {
      title: 'الإعدادات',
      subtitle: 'إدارة تفضيلات حسابك',
      language: 'اللغة',
      theme: 'المظهر',
      notifications: 'الإشعارات',
      privacy: 'الخصوصية',
      account: 'الحساب',
      about: 'حول',
      version: 'الإصدار',
      saveChanges: 'حفظ التغييرات',
      changesSaved: 'تم حفظ التغييرات بنجاح',
    },

    // Buttons
    buttons: {
      follow: 'متابعة',
      following: 'يتابع',
      unfollow: 'إلغاء المتابعة',
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      logout: 'تسجيل الخروج',
      send: 'إرسال',
      cancel: 'إلغاء',
      delete: 'حذف',
      save: 'حفظ',
      edit: 'تعديل',
      retry: 'إعادة المحاولة',
      backToHome: '← العودة للصفحة الرئيسية',
    },

    // Empty states
    empty: {
      noResults: 'لا توجد نتائج',
      noMessages: 'لا توجد رسائل بعد',
      noLinks: 'لا توجد روابط بعد',
      noFollowing: 'لا تتابع أحداً بعد',
      noFollowers: 'لا يوجد متابعون بعد',
      tryAgain: 'حاول مرة أخرى',
    },

    // Errors
    errors: {
      generic: 'حدث خطأ ما',
      network: 'خطأ في الشبكة. الرجاء التحقق من الاتصال.',
      notFound: 'غير موجود',
      unauthorized: 'وصول غير مصرح',
      sessionExpired: 'انتهت جلستك',
      tryAgain: 'الرجاء المحاولة مرة أخرى',
    },

    // Time
    time: {
      now: 'الآن',
      justNow: 'الآن',
      minutesAgo: (n) => `منذ ${n} د`,
      hoursAgo: (n) => `منذ ${n} س`,
      daysAgo: (n) => `منذ ${n} ي`,
      weeksAgo: (n) => `منذ ${n} أ`,
    },
  },

  ES: {
    // Common
    common: {
      loading: 'Cargando...',
      error: 'Ocurrió un error',
      retry: 'Reintentar',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      back: 'Atrás',
      next: 'Siguiente',
      done: 'Hecho',
      confirm: 'Confirmar',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      username: 'Usuario',
      password: 'Contraseña',
      email: 'Correo',
      name: 'Nombre',
      submit: 'Enviar',
    },

    // Auth
    auth: {
      login: 'Iniciar sesión',
      signup: 'Registrarse',
      logout: 'Cerrar sesión',
      loginTitle: 'Bienvenido de nuevo',
      loginSubtitle: 'Ingresa tus credenciales para continuar',
      signupTitle: 'Crear cuenta',
      signupSubtitle: 'Únete a nuestra comunidad anónima',
      forgotPassword: '¿Olvidaste tu contraseña?',
      rememberMe: 'Recordarme',
      secretPhrase: 'Frase secreta',
      secretAnswer: 'Respuesta secreta',
      createAccount: 'Crear cuenta',
      haveAccount: '¿Ya tienes cuenta?',
      noAccount: '¿No tienes cuenta?',
      recoverTitle: 'Recuperar cuenta',
      recoverSubtitle: 'Ingresa tu usuario para recuperar',
      recoverButton: 'Recuperar',
      backToLogin: 'Volver al inicio',
      loginSuccess: 'Sesión iniciada correctamente',
      signupSuccess: 'Cuenta creada correctamente',
      logoutSuccess: 'Sesión cerrada correctamente',
      invalidCredentials: 'Credenciales inválidas',
      userExists: 'El usuario ya existe',
      sessionExpired: 'Sesión expirada. Inicia sesión nuevamente',
      notAuthenticated: 'Inicia sesión para continuar',
    },

    // Navigation
    nav: {
      home: 'Inicio',
      links: 'Enlaces',
      search: 'Buscar',
      messages: 'Mensajes',
      profile: 'Perfil',
      settings: 'Ajustes',
    },

    // Profile
    profile: {
      eyebrow: 'Perfil',
      title: 'Tu centro anónimo',
      subtitle: 'Gestiona identidad, enlaces y amistades en un solo lugar.',
      editProfile: 'Editar perfil',
      viewLinks: 'Ver enlaces',
      viewMessages: 'Mensajes',
      guestTitle: 'Modo Invitado',
      guestSubtitle: 'Inicia sesión o regístrate para guardar tus datos.',
      copyUrl: 'Copiar URL del perfil',
      profileUrl: 'URL del perfil:',
      copied: '¡Copiado!',
      copy: 'Copiar',
    },

    // User Profile
    userProfile: {
      back: '← Atrás',
      sendAnonymous: 'Enviar mensaje anónimo',
      sendPlaceholder: 'Escribe una nota anónima...',
      sendCta: 'Enviar mensaje',
      sent: 'Mensaje enviado',
      emptyError: 'El mensaje no puede estar vacío',
      follow: 'Seguir',
      unfollow: 'Dejar de seguir',
      following: 'Siguiendo',
      loginToFollow: 'Inicia sesión para seguir',
      publicMessages: 'Mensajes públicos',
      noMessages: 'Sin mensajes públicos aún',
      noName: 'Sin nombre proporcionado',
      shareUrl: 'Compartir URL:',
      error: 'No se pudo cargar el perfil',
    },

    // Home
    home: {
      eyebrow: 'Feed',
      title: 'Tus seguidos',
      subtitle: 'Mantente conectado con las personas que sigues',
      emptyTitle: 'Crea tu comunidad',
      emptySubtitle: 'Conecta con amigos, comparte ideas y construye tu red. Comienza creando una cuenta y agregando personas para seguir.',
      getStarted: 'Comenzar',
      loadingFollowing: 'Cargando tus seguidos...',
      noFollowing: 'No sigues a nadie aún',
    },

    // Search
    search: {
      eyebrow: 'Buscar',
      title: 'Encuentra gente. Envía la verdad.',
      subtitle: 'Busca por usuario o nombre, agrega amigos, o envía mensajes anónimos.',
      search: 'Buscar',
      startText: 'Comienza a buscar',
      startDesc: 'Escribe un usuario o nombre para ver coincidencias.',
      searching: 'Buscando...',
      noResults: 'Sin coincidencias',
      noResultsDesc: 'Prueba otro nombre o verifica la ortografía.',
      placeholder: 'Buscar por usuario o nombre...',
      userNotFound: 'Usuario no encontrado',
      searchFailed: 'La búsqueda falló',
      loginRequired: 'Se requiere iniciar sesión para seguir.',
      alreadyFollowing: 'Ya sigues a este usuario',
      nowFollowing: '¡Ahora siguiendo!',
      unfollowed: 'Usuario dejado de seguir',
      couldNotFollow: 'No se pudo seguir al usuario',
      couldNotUnfollow: 'No se pudo dejar de seguir al usuario',
    },

    // Messages
    messages: {
      eyebrow: 'Bandeja',
      title: 'Mensajes anónimos',
      subtitle: 'Gestiona mensajes entre bandeja, público y eliminado.',
      tabInbox: 'Bandeja',
      tabPublic: 'Público',
      tabDeleted: 'Eliminado',
      helperInbox: 'Bandeja principal para notas anónimas.',
      helperPublic: 'Mensajes públicos visibles en tu perfil.',
      helperDeleted: 'Mensajes eliminados suavemente (archivados).',
      emptyTitle: 'Aún no hay mensajes',
      emptyText: 'Las notas anónimas aparecerán aquí. Prueba otro tab.',
      anonymous: 'Anónimo',
      anonymousTitle: 'Enviar mensaje anónimo',
      sent: 'Mensaje enviado',
      send: 'Enviar mensaje',
      messageSingular: 'mensaje',
      messagePlural: 'mensajes',
      tabs: {
        inbox: 'Bandeja',
        public: 'Público',
        deleted: 'Eliminado'
      },
      noMessages: 'Sin mensajes',
      noMessagesText: 'Tu lista de mensajes está vacía. ¡Verifica otras pestañas o pide a otros que te envíen mensajes!',
      timestampLabel: 'Ahora',
      makePublic: 'Hacer público',
      makePrivate: 'Hacer privado',
      error: 'Falló la actualización',
      success: 'Mensaje actualizado',
      lockedTitle: 'Mensajes bloqueados',
      lockedSubtitle: 'Inicia sesión para acceder a tu bandeja y gestionar mensajes privados. Crea una cuenta para recibir mensajes permanentes y conectar con otros.',
    },

    // Links
    links: {
      eyebrow: 'Enlaces',
      title: 'Enlaces temporales',
      subtitle: 'Crea enlaces anónimos y compártelos.',
      createNew: 'Crear nuevo enlace',
      activeLinks: 'Enlaces activos',
      noLinks: 'Sin enlaces activos aún',
      createFirst: 'Crea tu primer enlace',
      public: 'Público',
      private: 'Privado',
      expires: 'Expira',
      views: 'Vistas',
      delete: 'Eliminar',
      lockedTitle: 'Enlaces bloqueados',
      lockedSubtitle: 'Crea una cuenta para generar enlaces temporales y compartirlos con otros.',
      createLinkTitle: 'Crear enlace',
      generateTitle: 'Generar enlace temporal',
      generateSubtitle: 'Crea enlaces de mensajería anónima con expiración',
      displayNameLabel: 'Nombre para mostrar (opcional)',
      displayNamePlaceholder: 'ej., Comentarios anónimos',
      durationLabel: 'Duración del enlace',
      duration6h: '6 horas',
      duration12h: '12 horas',
      duration24h: '24 horas',
      duration7d: '1 semana',
      duration30d: '1 mes',
      guestWarning: 'Para crear enlaces de más de 24 horas, inicia sesión.',
      createBtn: 'Crear enlace',
      creating: 'Creando...',
      linksGenerated: 'Enlaces generados',
      expiresIn: 'Expira en:',
      publicLinkTitle: 'Enlace público',
      publicLinkDesc: 'Comparte esto - cualquiera puede enviar mensajes',
      privateLinkTitle: 'Enlace privado (Bandeja)',
      privateLinkDesc: 'Tu bandeja - ver mensajes recibidos',
      copyPublic: 'Copiar público',
      copyPrivate: 'Copiar privado',
      copied: '✓ Copiado',
      copy: 'Copiar',
      viewInbox: 'Ver bandeja',
      view: 'Ver',
      myLinksTitle: 'Mis enlaces',
      myLinksSubtitle: 'Gestiona tus enlaces de mensajería anónima',
      loginToView: 'Inicia sesión para ver enlaces guardados',
      guestLinksWarning: 'Los enlaces creados como invitado no se guardan. Inicia sesión para mantener y gestionar tus enlaces.',
      noLinksYet: 'Sin enlaces aún',
      noLinksDesc: 'Crea un enlace arriba para comenzar',
      anonymous: 'Anónimo',
      expired: '⏰ Expirado',
      permanent: 'Permanente',
      days: 'días',
      hours: 'horas',
      lessThanHour: 'Menos de 1 hora',
      created: 'Creado',
    },

    // Settings
    settings: {
      title: 'Ajustes',
      subtitle: 'Gestiona las preferencias de tu cuenta',
      language: 'Idioma',
      theme: 'Tema',
      notifications: 'Notificaciones',
      privacy: 'Privacidad',
      account: 'Cuenta',
      about: 'Acerca de',
      version: 'Versión',
      saveChanges: 'Guardar cambios',
      changesSaved: 'Cambios guardados correctamente',
    },

    // Buttons
    buttons: {
      follow: 'Seguir',
      following: 'Siguiendo',
      unfollow: 'Dejar de seguir',
      login: 'Iniciar sesión',
      signup: 'Registrarse',
      logout: 'Cerrar sesión',
      send: 'Enviar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      save: 'Guardar',
      edit: 'Editar',
      retry: 'Reintentar',
      backToHome: '← Volver al inicio',
    },

    // Empty states
    empty: {
      noResults: 'Sin resultados',
      noMessages: 'Sin mensajes aún',
      noLinks: 'Sin enlaces aún',
      noFollowing: 'No sigues a nadie aún',
      noFollowers: 'Sin seguidores aún',
      tryAgain: 'Intentar de nuevo',
    },

    // Errors
    errors: {
      generic: 'Algo salió mal',
      network: 'Error de red. Verifica tu conexión.',
      notFound: 'No encontrado',
      unauthorized: 'Acceso no autorizado',
      sessionExpired: 'Tu sesión ha expirado',
      tryAgain: 'Intenta de nuevo',
    },

    // Time
    time: {
      now: 'Ahora',
      justNow: 'Justo ahora',
      minutesAgo: (n) => `Hace ${n}m`,
      hoursAgo: (n) => `Hace ${n}h`,
      daysAgo: (n) => `Hace ${n}d`,
      weeksAgo: (n) => `Hace ${n}s`,
    },
  },
};

// Detect device language (browser language)
export const detectDeviceLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split('-')[0].toUpperCase();
  
  // Map browser language to our supported languages
  if (langCode === 'AR') return 'AR';
  if (langCode === 'ES') return 'ES';
  return 'EN'; // Default to English
};

// Get saved language from localStorage or detect device language
export const getInitialLanguage = () => {
  const savedLang = localStorage.getItem('appLanguage');
  if (savedLang && ['EN', 'AR', 'ES'].includes(savedLang)) {
    return savedLang;
  }
  return detectDeviceLanguage();
};

// Save language to localStorage
export const saveLanguage = (lang) => {
  localStorage.setItem('appLanguage', lang);
};

// Translation hook (can be used in any component)
export const useTranslation = (currentLanguage) => {
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[currentLanguage];
    
    for (const k of keys) {
      value = value?.[k];
      if (!value) return key; // Return key if translation not found
    }
    
    return value;
  };
  
  return { t, isRTL: currentLanguage === 'AR' };
};
