# গিটহাব (GitHub) থেকে Android APK / App তৈরি করার সম্পূর্ণ গাইডলাইন

আমাদের **SPay DevHub** প্রকল্পটি React, Vite, TypeScript ও PWA (Progressive Web App) আর্কিটেকচারে তৈরি। আপনি খুব সহজেই গিটহাব থেকে সরাসরি অ্যান্ড্রয়েড অ্যাপ (.apk / .aab) তৈরি করতে পারেন।

এখানে **৩টি কার্যকর ও সহজ পদ্ধতি** দেওয়া হলো:

---

## পদ্ধতি ১: GitHub Actions দিয়ে স্বয়ংক্রিয়ভাবে APK ডাউনলোড (কোনো সফটওয়্যার ইনস্টল ছাড়াই) 🚀

আমরা ইতিমধ্যে আপনার প্রজেক্টে **`.github/workflows/android-apk.yml`** যোগ করে দিয়েছি। গিটহাব ক্লাউড সার্ভার নিজেই পুরো Android APK তৈরি করে দিবে!

### ধাপসমূহ:
1. আপনার কোডটি গিটহাব রিপোজিটরির `main` বা `master` ব্রাঞ্চে **Push** করুন:
   ```bash
   git add .
   git commit -m "Add Android build workflow"
   git push origin main
   ```
2. আপনার গিটহাব রিপোজিটরিতে যান এবং উপরে থাকা **"Actions"** ট্যাবে ক্লিক করুন।
3. বামপাশে **"Build Android APK"** ওয়ার্কফ্লোতে ক্লিক করুন।
4. ডানপাশে **"Run workflow"** বাটনে চাপ দিন (অথবা পুশ করলেই অটো রান হবে)।
5. ৩-৪ মিনিট পর বিল্ড সফল (সবুজ টিক চিহ্ন) হলে ওয়ার্কফ্লো নামের উপর ক্লিক করুন।
6. নিচের দিকে **"Artifacts"** সেকশনে **`SPay-DevHub-Android-Debug-APK`** নামের ফাইলটি পেয়ে যাবেন।
7. ক্লিক করে জিপ ফাইলটি ডাউনলোড করুন এবং আনজিপ করে আপনার অ্যান্ড্রয়েড ফোনে ইনস্টল করে নিন!

---

## পদ্ধতি ২: আপনার কম্পিউটারে Android Studio ও Capacitor দিয়ে বিল্ড করা 💻

আপনার পিসিতে যদি Node.js এবং Android Studio থাকে, তবে মাত্র ৪টি কমান্ড দিয়ে APK বানাতে পারবেন:

### ১. ডিপেন্ডেন্সি ও বিল্ড তৈরি:
```bash
# গিটহাব থেকে রিপোজিটরি ক্লোন করুন (যদি না থাকে)
git clone <YOUR_GITHUB_REPO_URL>
cd spay-devhub

# প্যাকেজ ইনস্টল করুন
npm install

# Capacitor টুল ইনস্টল করুন
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### ২. প্রোডাকশন ওয়েব অ্যাসেট বিল্ড:
```bash
npm run build
```

### ৩. অ্যান্ড্রয়েড প্ল্যাটফর্ম যুক্ত ও সিঙ্ক:
```bash
npx cap add android
npx cap sync android
```

### ৪. Android Studio দিয়ে APK তৈরি:
```bash
npx cap open android
```
- এটি স্বয়ংক্রিয়ভাবে **Android Studio** চালু করবে।
- গ্র্যাডল সিঙ্ক সম্পন্ন হলে মেনুবার থেকে **Build > Build Bundle(s) / APK(s) > Build APK(s)** চাপুন।
- কয়েক সেকেন্ডে আপনার APK তৈরি হয়ে যাবে (লোকেশন: `android/app/build/outputs/apk/debug/app-debug.apk`)।

---

## পদ্ধতি ৩: PWABuilder দিয়ে ১-ক্লিকে Google Play Store প্যাকেজ (.AAB / .APK) তৈরি 🌐

যেহেতু এই অ্যাপটিতে ইতিমধ্যে **Web App Manifest** (`manifest.json`) এবং **Service Worker** (`sw.js`) কনফিগার করা আছে:

1. আপনার অ্যাপটি Vercel, Netlify বা Firebase-এ হোস্ট করুন (যেমন আপনার ডেভেলপমেন্ট URL বা লাইভ সাইট)।
2. **[PWABuilder.com](https://www.pwabuilder.com)** ওয়েবসাইটে যান।
3. আপনার অ্যাপের লাইভ লিংকটি পেস্ট করে **"Start"** চাপুন।
4. সাইটটির স্কোর ১০০% দেখাবে। এরপর **"Package for Stores"** বাটনে চাপুন।
5. **Android** অপশন বেছে নিয়ে:
   - প্যাকেজ আইডি দিন (যেমন: `com.shurjopay.devhub`)
   - অ্যাপের নাম ও আইকন যাচাই করুন
   - **"Generate"** চাপলে সরাসরি Google Play Store-এ আপলোড করার উপযুক্ত **Signed Android App Bundle (.aab)** এবং টেস্ট করার জন্য **APK** ডাউনলোড হয়ে যাবে!

---

## তৈরি ফাইলসমূহ:
- `.github/workflows/android-apk.yml`: ক্লাউডে অটোমেটিক APK তৈরি করার স্ক্রিপ্ট
- `capacitor.config.json`: অ্যান্ড্রয়েড প্যাকেজ আইডি ও অ্যাপ কনফিগারেশন
- `public/manifest.json`: PWA ও অ্যান্ড্রয়েড অ্যাপ আইকন ও কালার স্কিম
- `package.json`: `npm run cap:sync` এবং `npm run cap:open` শর্টকাট স্ক্রিপ্ট
