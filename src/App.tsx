import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  UserPlus,
  Lock,
  LogIn,
  CheckCircle,
  AlertCircle,
  BarChart2,
  Grid,
  Printer,
  LogOut,
  Heart,
  UserCheck,
  AlertTriangle,
  ShieldAlert,
  Download,
  Trash2,
  X,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";

// --- Firebase Configuration ---
// هذه هي إعدادات مشروعك الحقيقية التي تم تفعيلها (hatavntira)
const customFirebaseConfig = {
  apiKey: "AIzaSyCA0fAtxAxzT5BlA5pau_6MoewFdYYlWWM",
  authDomain: "hatavntira.firebaseapp.com",
  projectId: "hatavntira",
  storageBucket: "hatavntira.firebasestorage.app",
  messagingSenderId: "138143951633",
  appId: "1:138143951633:web:8e3e331c407775a229bab0",
  measurementId: "G-GXXPT48NQ0",
};

const app = initializeApp(customFirebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// نستخدم الـ projectId كمعرف أساسي للتطبيق
const appId = customFirebaseConfig.projectId;

// --- Constants ---
const CLASSES = [
  "سابع 1",
  "سابع 2",
  "سابع 3",
  "سابع 4",
  "سابع 5",
  "ثامن 1",
  "ثامن 2",
  "ثامن 3",
  "ثامن 4",
  "ثامن 5",
  "ثامن 6",
  "ثامن 7",
];

const PASSWORDS = {
  "سابع 1": "7111",
  "سابع 2": "7222",
  "سابع 3": "7333",
  "سابع 4": "7444",
  "سابع 5": "7555",
  "ثامن 1": "8111",
  "ثامن 2": "8222",
  "ثامن 3": "8333",
  "ثامن 4": "8444",
  "ثامن 5": "8555",
  "ثامن 6": "8666",
  "ثامن 7": "8777",
};

// --- Helper Functions ---
// توحيد كتابة الأسماء العربية لتجنب الأخطاء (مثل أ، إ، ا)
const normalizeName = (name) => {
  if (!name) return "";
  return name
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ");
};

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [currentView, setCurrentView] = useState("home"); // home, student, teacherLogin, teacherDashboard
  const [loggedInClass, setLoggedInClass] = useState(null);

  // تهيئة تسجيل الدخول المجهول
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Authentication failed:", error);
        setAuthError("حدث خطأ في المصادقة: " + error.message);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  if (authError) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans"
        dir="rtl"
      >
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border-t-4 border-red-500">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={56} />
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            خطأ في الاتصال بقاعدة البيانات
          </h2>
          <p className="text-slate-600 mb-6">{authError}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-50 text-indigo-600"
        dir="rtl"
      >
        <span className="animate-pulse flex items-center gap-2">
          <Users className="animate-spin" /> جاري التحميل...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      {/* Navigation Bar (Hidden in Print) */}
      <nav className="bg-indigo-600 text-white p-4 shadow-md print:hidden">
        <div className="container mx-auto flex justify-between items-center">
          <div
            className="flex items-center gap-2 text-xl font-bold cursor-pointer"
            onClick={() => setCurrentView("home")}
          >
            <Users />
            <span>نظام التحليل السوسيومتري - الاعدادية ب الطيرة</span>
          </div>
          <div className="flex items-center gap-4">
            {loggedInClass && currentView === "teacherDashboard" && (
              <>
                <span className="bg-indigo-700 px-3 py-1 rounded-full text-sm">
                  صف {loggedInClass}
                </span>
                <button
                  onClick={() => {
                    setLoggedInClass(null);
                    setCurrentView("home");
                  }}
                  className="flex items-center gap-1 hover:text-indigo-200 transition"
                >
                  <LogOut size={18} /> خروج
                </button>
              </>
            )}
            {currentView !== "home" && !loggedInClass && (
              <button
                onClick={() => setCurrentView("home")}
                className="hover:text-indigo-200 transition text-sm"
              >
                الرئيسية
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="container mx-auto p-4 md:p-8">
        {currentView === "home" && <HomeView setView={setCurrentView} />}
        {currentView === "student" && <StudentForm setView={setCurrentView} />}
        {currentView === "teacherLogin" && (
          <TeacherLogin
            setView={setCurrentView}
            setLoggedInClass={setLoggedInClass}
          />
        )}
        {currentView === "teacherDashboard" && (
          <TeacherDashboard selectedClass={loggedInClass} user={user} />
        )}
      </main>
    </div>
  );
}

// --- Home View ---
function HomeView({ setView }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4">
          أهلاً بك في نظام الاستبيان السوسيومتري
        </h1>
        <p className="text-slate-600 text-lg">
          يرجى اختيار البوابة المناسبة للدخول
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <button
          onClick={() => setView("student")}
          className="group flex flex-col items-center justify-center bg-white p-10 rounded-2xl shadow-lg hover:shadow-xl hover:border-indigo-500 border-2 border-transparent transition-all"
        >
          <div className="bg-indigo-100 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
            <UserPlus size={64} className="text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            دخول الطالب
          </h2>
          <p className="text-slate-500 text-center">
            للمشاركة في الاستبيان وإدخال الاختيارات
          </p>
        </button>

        <button
          onClick={() => setView("teacherLogin")}
          className="group flex flex-col items-center justify-center bg-white p-10 rounded-2xl shadow-lg hover:shadow-xl hover:border-teal-500 border-2 border-transparent transition-all"
        >
          <div className="bg-teal-100 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
            <Lock size={64} className="text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            دخول المعلم / المستشارة
          </h2>
          <p className="text-slate-500 text-center">
            لعرض النتائج، المصفوفة، والتحليلات
          </p>
        </button>
      </div>
    </div>
  );
}

// --- Student Form View ---
function StudentForm({ setView }) {
  const [formData, setFormData] = useState({
    name: "",
    className: "",
    choiceA: "",
    choiceB: "",
    choiceC: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    const { name, className, choiceA, choiceB, choiceC } = formData;
    if (!name.trim()) return setError("يرجى إدخال اسمك الكامل.");
    if (!className) return setError("يرجى اختيار الصف.");
    if (!choiceA.trim()) return setError("الاختيار الأول (A) مطلوب.");

    const normName = normalizeName(name);
    const normA = normalizeName(choiceA);
    const normB = normalizeName(choiceB);
    const normC = normalizeName(choiceC);

    if (normName === normA || normName === normB || normName === normC) {
      return setError("لا يمكنك اختيار نفسك!");
    }

    const choices = [normA];
    if (normB) {
      if (choices.includes(normB))
        return setError("لقد قمت بتكرار نفس الاسم في اختياراتك.");
      choices.push(normB);
    }
    if (normC) {
      if (choices.includes(normC))
        return setError("لقد قمت بتكرار نفس الاسم في اختياراتك.");
    }

    setIsSubmitting(true);
    try {
      const publicDataRef = collection(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "sociometric_surveys"
      );
      await addDoc(publicDataRef, {
        studentName: name.trim(),
        className: className,
        choiceA: choiceA.trim(),
        choiceB: choiceB.trim(),
        choiceC: choiceC.trim(),
        timestamp: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      if (err.code === "permission-denied") {
        setError(
          "خطأ في الصلاحيات. تأكد أن قاعدة البيانات في وضع الاختبار (Test Mode)."
        );
      } else {
        setError("حدث خطأ أثناء إرسال البيانات. يرجى المحاولة مرة أخرى.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg text-center mt-10">
        <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          تم الإرسال بنجاح
        </h2>
        <p className="text-slate-600 mb-8">
          تم حفظ إجابتك بنجاح، شكرًا لمشاركتك.
        </p>
        <button
          onClick={() => setView("home")}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl mt-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-indigo-700 mb-2">
          استبيان العلاقات الاجتماعية
        </h2>
        <p className="text-slate-500">يرجى كتابة أسماء زملائك المفضلين بدقة.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2 mb-6">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-slate-700 font-semibold mb-2">
            اسم الطالب الثلاثي (اسمك) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="أدخل اسمك الكامل هنا..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-2">
            الصف والشعبة <span className="text-red-500">*</span>
          </label>
          <select
            required
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.className}
            onChange={(e) =>
              setFormData({ ...formData, className: e.target.value })
            }
          >
            <option value="">-- اختر الصف --</option>
            {CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-800 mb-4">
            اختياراتك (من تفضل أن تكون معهم؟)
          </h3>

          <div>
            <label className="block text-slate-700 mb-2">
              الاختيار الأول (A) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full p-3 border border-green-300 bg-green-50 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="اكتب اسم الطالب الأول يدوياً..."
              value={formData.choiceA}
              onChange={(e) =>
                setFormData({ ...formData, choiceA: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-2">
              الاختيار الثاني (B){" "}
              <span className="text-slate-400 text-sm">(اختياري)</span>
            </label>
            <input
              type="text"
              className="w-full p-3 border border-blue-300 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="اكتب اسم الطالب الثاني يدوياً..."
              value={formData.choiceB}
              onChange={(e) =>
                setFormData({ ...formData, choiceB: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-2">
              الاختيار الثالث (C){" "}
              <span className="text-slate-400 text-sm">(اختياري)</span>
            </label>
            <input
              type="text"
              className="w-full p-3 border border-yellow-300 bg-yellow-50 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              placeholder="اكتب اسم الطالب الثالث يدوياً..."
              value={formData.choiceC}
              onChange={(e) =>
                setFormData({ ...formData, choiceC: e.target.value })
              }
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-md transition disabled:opacity-70 flex justify-center items-center gap-2"
        >
          {isSubmitting ? (
            <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-6 h-6"></span>
          ) : (
            "إرسال الإجابات"
          )}
        </button>
      </form>
    </div>
  );
}

// --- Teacher Login View ---
function TeacherLogin({ setView, setLoggedInClass }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (!selectedClass) return setError("يرجى اختيار الصف");

    if (PASSWORDS[selectedClass] === password) {
      setLoggedInClass(selectedClass);
      setView("teacherDashboard");
    } else {
      setError("كلمة المرور غير صحيحة");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl mt-10">
      <div className="text-center mb-8">
        <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="text-teal-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">
          بوابة المعلم والمستشارة
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-slate-700 font-semibold mb-2">
            اختر الصف
          </label>
          <select
            required
            className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-teal-500"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">-- اختر الصف --</option>
            {CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-2">
            كلمة المرور
          </label>
          <input
            type="password"
            required
            className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-teal-500 text-left"
            dir="ltr"
            placeholder="****"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition flex justify-center items-center gap-2"
        >
          <LogIn size={20} /> تسجيل الدخول
        </button>
      </form>
    </div>
  );
}

// --- Teacher Dashboard View ---
function TeacherDashboard({ selectedClass, user }) {
  const [activeTab, setActiveTab] = useState("matrix"); // matrix, analytics, insights
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Data for the selected class
  useEffect(() => {
    if (!user || !selectedClass) return;

    const q = query(
      collection(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "sociometric_surveys"
      )
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allDocs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const classData = allDocs.filter((d) => d.className === selectedClass);
        setData(classData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, selectedClass]);

  // Data Processing Logic (Memoized for performance)
  const processedData = useMemo(() => {
    if (!data || data.length === 0)
      return {
        uniqueStudents: [],
        matrix: [],
        scores: {},
        analytics: [],
        insights: {},
      };

    // 1. Gather all unique normalized names
    const nameMap = new Map(); // normalized -> original
    const recordOriginalName = (rawName) => {
      if (!rawName) return null;
      const norm = normalizeName(rawName);
      if (norm && !nameMap.has(norm)) nameMap.set(norm, rawName.trim());
      return norm;
    };

    const voters = new Set();
    data.forEach((sub) => {
      const nSender = recordOriginalName(sub.studentName);
      if (nSender) voters.add(nSender);
      recordOriginalName(sub.choiceA);
      recordOriginalName(sub.choiceB);
      recordOriginalName(sub.choiceC);
    });

    const uniqueNormNames = Array.from(nameMap.keys());
    const uniqueStudents = uniqueNormNames.map((norm) => ({
      norm,
      original: nameMap.get(norm),
      hasVoted: voters.has(norm),
    }));

    // 2. Initialize Scores
    const scores = {};
    const analyticsMap = {};
    uniqueNormNames.forEach((n) => {
      scores[n] = 0;
      analyticsMap[n] = {
        norm: n,
        original: nameMap.get(n),
        A: 0,
        B: 0,
        C: 0,
        total: 0,
      };
    });

    // 3. Build Matrix & Calculate Scores
    const submissionsByNormVoter = {};

    data.forEach((sub) => {
      const nSender = normalizeName(sub.studentName);
      submissionsByNormVoter[nSender] = {
        A: normalizeName(sub.choiceA),
        B: normalizeName(sub.choiceB),
        C: normalizeName(sub.choiceC),
      };

      const applyVote = (choiceRaw, level, points) => {
        const nReceiver = normalizeName(choiceRaw);
        if (nReceiver) {
          scores[nReceiver] += points;
          analyticsMap[nReceiver][level]++;
          analyticsMap[nReceiver].total += points;
        }
      };

      applyVote(sub.choiceA, "A", 3);
      applyVote(sub.choiceB, "B", 2);
      applyVote(sub.choiceC, "C", 1);
    });

    // Sort unique students by Total points for column display
    uniqueStudents.sort((a, b) => scores[b.norm] - scores[a.norm]);

    // Build Matrix: N x N square matrix so rows (Y) match columns (X) exactly
    const matrix = uniqueStudents.map((student) => {
      const v = submissionsByNormVoter[student.norm];
      const choices = {};
      if (v) {
        if (v.A) choices[v.A] = "A";
        if (v.B) choices[v.B] = "B";
        if (v.C) choices[v.C] = "C";
      }
      return {
        sender: student.original,
        normSender: student.norm,
        choices,
      };
    });

    // 4. Generate Analytics Array
    const analytics = Object.values(analyticsMap).sort(
      (a, b) => b.total - a.total
    );

    // 5. Generate Counseling Insights
    const mostAccepted = analytics.slice(0, 3).filter((s) => s.total > 0);
    const leaders = [...analytics]
      .sort((a, b) => b.A - a.A)
      .filter((s) => s.A > 1)
      .slice(0, 4);
    const isolated = analytics.filter((s) => s.total === 0);

    const mutuals = [];
    const processedPairs = new Set();
    uniqueNormNames.forEach((n1) => {
      uniqueNormNames.forEach((n2) => {
        if (n1 !== n2) {
          const pairKey = [n1, n2].sort().join("-");
          if (!processedPairs.has(pairKey)) {
            const n1Votes = submissionsByNormVoter[n1];
            const n2Votes = submissionsByNormVoter[n2];

            const n1ChoseN2 =
              n1Votes &&
              (n1Votes.A === n2 || n1Votes.B === n2 || n1Votes.C === n2);
            const n2ChoseN1 =
              n2Votes &&
              (n2Votes.A === n1 || n2Votes.B === n1 || n2Votes.C === n1);

            if (n1ChoseN2 && n2ChoseN1) {
              mutuals.push({ s1: nameMap.get(n1), s2: nameMap.get(n2) });
              processedPairs.add(pairKey);
            }
          }
        }
      });
    });

    const cliques = [];
    const processedCliques = new Set();
    uniqueNormNames.forEach((n1) => {
      uniqueNormNames.forEach((n2) => {
        uniqueNormNames.forEach((n3) => {
          if (n1 !== n2 && n2 !== n3 && n1 !== n3) {
            const cliqueKey = [n1, n2, n3].sort().join("-");
            if (!processedCliques.has(cliqueKey)) {
              const v1 = submissionsByNormVoter[n1];
              const v2 = submissionsByNormVoter[n2];
              const v3 = submissionsByNormVoter[n3];

              const _1to2 = v1 && (v1.A === n2 || v1.B === n2 || v1.C === n2);
              const _2to3 = v2 && (v2.A === n3 || v2.B === n3 || v2.C === n3);
              const _3to1 = v3 && (v3.A === n1 || v3.B === n1 || v3.C === n1);

              if (_1to2 && _2to3 && _3to1) {
                cliques.push([
                  nameMap.get(n1),
                  nameMap.get(n2),
                  nameMap.get(n3),
                ]);
                processedCliques.add(cliqueKey);
              }
            }
          }
        });
      });
    });

    const alerts = [];
    analytics.forEach((s) => {
      const v = submissionsByNormVoter[s.norm];
      const hasVoted = !!v;

      if (s.total === 0 && hasVoted) {
        alerts.push(
          `الطالب/ة "${s.original}" قام بالاختيار لكن لم يتم اختياره من أحد.`
        );
      } else if (s.total === 0 && !hasVoted) {
        alerts.push(
          `الطالب/ة "${s.original}" لم يُختر من أحد ولم يشارك في الاستبيان.`
        );
      }

      if (s.total > 15) {
        alerts.push(
          `الطالب/ة "${s.original}" يحظى بشعبية استثنائية (نقاط عالية جداً).`
        );
      }
    });

    return {
      uniqueStudents,
      matrix,
      scores,
      analytics,
      insights: { mostAccepted, leaders, isolated, mutuals, cliques, alerts },
    };
  }, [data]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent +=
      "اسم الطالب,الصف,الاختيار A,الاختيار B,الاختيار C,مجموع النقاط\n";

    processedData.analytics.forEach((s) => {
      const studentData = data.find(
        (d) => normalizeName(d.studentName) === s.norm
      );
      const cA = studentData?.choiceA || "لم يختار";
      const cB = studentData?.choiceB || "لم يختار";
      const cC = studentData?.choiceC || "لم يختار";
      csvContent += `"${s.original}","${selectedClass}","${cA}","${cB}","${cC}","${s.total}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `نتائج_سوسيومترية_صف_${selectedClass}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteClassData = async () => {
    setIsDeleting(true);
    try {
      const deletePromises = data.map((item) =>
        deleteDoc(
          doc(
            db,
            "artifacts",
            appId,
            "public",
            "data",
            "sociometric_surveys",
            item.id
          )
        )
      );
      await Promise.all(deletePromises);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting data:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-20">
        <span className="animate-pulse">جاري جلب بيانات الصف...</span>
      </div>
    );

  return (
    <div className="space-y-6 printable-area">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            نتائج الاستبيان - صف {selectedClass}
          </h2>
          <p className="text-slate-500">
            إجمالي المشاركات: {data.length} طالب/ة
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3 print:hidden">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-lg transition"
          >
            <Trash2 size={18} /> مسح البيانات
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-4 py-2 rounded-lg transition"
          >
            <Download size={18} /> حفظ كملف Excel
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition"
          >
            <Printer size={18} /> طباعة التقرير
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 print:hidden mb-6 overflow-x-auto">
        <TabButton
          active={activeTab === "matrix"}
          onClick={() => setActiveTab("matrix")}
          icon={<Grid size={18} />}
          label="المصفوفة"
        />
        <TabButton
          active={activeTab === "analytics"}
          onClick={() => setActiveTab("analytics")}
          icon={<BarChart2 size={18} />}
          label="التحليلات"
        />
        <TabButton
          active={activeTab === "insights"}
          onClick={() => setActiveTab("insights")}
          icon={<Heart size={18} />}
          label="الرؤى الإرشادية"
        />
      </div>

      {/* Content Areas */}
      <div className="print-content space-y-10">
        {(activeTab === "matrix" || true) && (
          <div
            className={activeTab === "matrix" ? "block" : "hidden print:block"}
          >
            <MatrixView data={processedData} />
          </div>
        )}

        {(activeTab === "analytics" || true) && (
          <div
            className={
              activeTab === "analytics" ? "block" : "hidden print:block"
            }
          >
            <AnalyticsView data={processedData} />
          </div>
        )}

        {(activeTab === "insights" || true) && (
          <div
            className={
              activeTab === "insights" ? "block" : "hidden print:block"
            }
          >
            <InsightsView data={processedData} />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => !isDeleting && setShowDeleteModal(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-slate-700 transition"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-red-600 flex items-center gap-2 mb-4">
              <AlertTriangle /> تحذير مسح البيانات
            </h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              هل أنت متأكد من رغبتك في مسح جميع الإجابات والبيانات الخاصة بـ{" "}
              <b>صف {selectedClass}</b>؟
              <br />
              <br />
              <span className="text-sm text-red-500 font-bold">
                تنبيه: لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.
              </span>
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteClassData}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition flex items-center gap-2 font-medium disabled:opacity-70"
              >
                {isDeleting ? (
                  <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                ) : (
                  <Trash2 size={18} />
                )}
                نعم، امسح البيانات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .printable-area { width: 100%; margin: 0; padding: 0; }
          .print-content > div { page-break-inside: avoid; margin-bottom: 2cm; }
          @page { size: A4 landscape; margin: 1.5cm; }
          table { width: 100% !important; border-collapse: collapse; }
          th, td { border: 1px solid #cbd5e1 !important; padding: 4px !important; font-size: 11px !important; }
        }
      `,
        }}
      />
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition whitespace-nowrap ${
        active
          ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
          : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
      }`}
    >
      {icon} {label}
    </button>
  );
}

// --- Matrix View ---
function MatrixView({ data }) {
  const { uniqueStudents, matrix, scores } = data;

  if (uniqueStudents.length === 0) {
    return (
      <div className="bg-white p-10 text-center rounded-xl shadow border border-slate-200 text-slate-500">
        لا توجد بيانات متاحة لهذا الصف بعد.
      </div>
    );
  }

  const distinctScores = [...new Set(Object.values(scores))].sort(
    (a, b) => b - a
  );
  const topScoresThreshold =
    distinctScores.length >= 3
      ? distinctScores[2]
      : distinctScores[distinctScores.length - 1];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Grid className="text-indigo-500" /> المصفوفة السوسيومترية
        </h3>
        <div className="flex gap-4 text-xs font-medium">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-100 border border-green-400 inline-block rounded-sm"></span>{" "}
            A (3 نقاط)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-100 border border-blue-400 inline-block rounded-sm"></span>{" "}
            B (نقطتان)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-yellow-100 border border-yellow-400 inline-block rounded-sm"></span>{" "}
            C (نقطة)
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-center border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-slate-100 min-w-[120px] sticky right-0 z-10 text-right">
                المُختَارون ➔<br />
                الذين اختاروا ⬇
              </th>
              {uniqueStudents.map((u, i) => (
                <th
                  key={i}
                  className="border p-2 bg-slate-50 max-w-[80px] font-medium truncate"
                  title={u.original}
                >
                  <div className="-rotate-45 md:rotate-0 whitespace-nowrap overflow-hidden text-ellipsis">
                    {u.original.split(" ")[0]}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50 transition">
                <td
                  className="border p-2 bg-slate-50 sticky right-0 z-10 text-right font-medium truncate max-w-[120px]"
                  title={row.sender}
                >
                  {row.sender}
                </td>
                {uniqueStudents.map((col, j) => {
                  const choice = row.choices[col.norm];
                  let bgClass = "";
                  if (choice === "A")
                    bgClass = "bg-green-100 font-bold text-green-700";
                  else if (choice === "B")
                    bgClass = "bg-blue-100 font-bold text-blue-700";
                  else if (choice === "C")
                    bgClass = "bg-yellow-100 font-bold text-yellow-700";

                  return (
                    <td key={j} className={`border p-2 ${bgClass}`}>
                      {choice || ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-slate-100">
              <td className="border p-2 sticky right-0 z-10 text-right text-slate-700">
                مجموع النقاط
              </td>
              {uniqueStudents.map((u, i) => {
                const score = scores[u.norm];
                const isTop = score >= topScoresThreshold && score > 0;
                const isZero = score === 0;

                let highlightClass = "text-slate-800";
                if (isTop)
                  highlightClass = "bg-indigo-100 text-indigo-700 shadow-inner";
                if (isZero)
                  highlightClass = "bg-red-50 text-red-300 opacity-60";

                return (
                  <td
                    key={i}
                    className={`border p-2 text-lg ${highlightClass}`}
                  >
                    {score}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// --- Analytics View ---
function AnalyticsView({ data }) {
  const { analytics } = data;

  if (analytics.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <BarChart2 className="text-teal-500" /> تفريغ النقاط والتحليلات
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-center">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="border p-3 text-right">اسم الطالب</th>
              <th className="border p-3 text-green-700">A (×3)</th>
              <th className="border p-3 text-blue-700">B (×2)</th>
              <th className="border p-3 text-yellow-700">C (×1)</th>
              <th className="border p-3 bg-indigo-50 text-indigo-800 text-lg">
                المجموع
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {analytics.map((row, i) => (
              <tr
                key={i}
                className={
                  row.total === 0
                    ? "bg-red-50/30 text-slate-500"
                    : "hover:bg-slate-50"
                }
              >
                <td className="border p-3 text-right font-medium">
                  {row.original}
                </td>
                <td className="border p-3">{row.A}</td>
                <td className="border p-3">{row.B}</td>
                <td className="border p-3">{row.C}</td>
                <td className="border p-3 font-bold bg-indigo-50/30 text-indigo-700">
                  {row.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Insights View ---
function InsightsView({ data }) {
  const { insights } = data;

  if (!insights.mostAccepted) return null;

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-2xl text-slate-800 flex items-center gap-2 mb-4 print:hidden">
        <Heart className="text-rose-500" /> الرؤى الإرشادية
      </h3>
      <p className="text-slate-500 mb-6 print:hidden">
        قراءة تحليلية تلقائية لنتائج المصفوفة لمساعدة المستشارة والمعلم في فهم
        الديناميكية الاجتماعية للصف.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm border-t-4 border-t-indigo-500">
          <h4 className="font-bold text-indigo-800 flex items-center gap-2 mb-4">
            <UserCheck size={20} /> الطلاب الأكثر قبولاً اجتماعياً
          </h4>
          <p className="text-sm text-slate-500 mb-3">
            الطلاب ذوو التأثير الاجتماعي الإيجابي (الأعلى نقاطاً):
          </p>
          <ul className="space-y-2">
            {insights.mostAccepted.length > 0 ? (
              insights.mostAccepted.map((s, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center bg-indigo-50 p-2 rounded px-3"
                >
                  <span className="font-medium text-slate-700">
                    {s.original}
                  </span>
                  <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full">
                    {s.total} نقطة
                  </span>
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-400">لا يوجد بيانات كافية.</li>
            )}
          </ul>
        </div>

        <div className="bg-white p-5 rounded-xl border border-teal-100 shadow-sm border-t-4 border-t-teal-500">
          <h4 className="font-bold text-teal-800 flex items-center gap-2 mb-4">
            <Users size={20} /> طلاب ذوو حضور اجتماعي قوي
          </h4>
          <p className="text-sm text-slate-500 mb-3">
            الطلاب الذين شكلوا "الاختيار الأول" لعدد كبير من زملائهم:
          </p>
          <ul className="space-y-2">
            {insights.leaders.length > 0 ? (
              insights.leaders.map((s, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center bg-teal-50 p-2 rounded px-3"
                >
                  <span className="font-medium text-slate-700">
                    {s.original}
                  </span>
                  <span className="text-xs bg-teal-200 text-teal-800 px-2 py-1 rounded-full">
                    {s.A} اختيارات A
                  </span>
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-400">
                لا يوجد بيانات كافية لتحديد القيادات.
              </li>
            )}
          </ul>
        </div>

        <div className="bg-white p-5 rounded-xl border border-rose-100 shadow-sm border-t-4 border-t-rose-400">
          <h4 className="font-bold text-rose-800 flex items-center gap-2 mb-4">
            <Heart size={20} /> علاقات متبادلة (أزواج)
          </h4>
          <p className="text-sm text-slate-500 mb-3">
            طلاب اختاروا بعضهم البعض مما يدل على صداقة قوية:
          </p>
          <div className="flex flex-wrap gap-2">
            {insights.mutuals.length > 0 ? (
              insights.mutuals.map((m, i) => (
                <span
                  key={i}
                  className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-3 py-1.5 rounded-full flex items-center gap-2"
                >
                  {m.s1}{" "}
                  <Heart size={12} className="fill-rose-300 text-rose-300" />{" "}
                  {m.s2}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-400">
                لم يتم رصد علاقات متبادلة واضحة.
              </span>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-100 shadow-sm border-t-4 border-t-amber-400">
          <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-4">
            <ShieldAlert size={20} /> طلاب يحتاجون إلى متابعة واحتواء
          </h4>
          <p className="text-sm text-slate-500 mb-3">
            طلاب لم يحصلوا على نقاط أو اختيارات، قد يحتاجون لدعم في الاندماج:
          </p>
          <ul className="space-y-2">
            {insights.isolated.length > 0 ? (
              insights.isolated.map((s, i) => (
                <li
                  key={i}
                  className="bg-amber-50 text-amber-800 p-2 rounded px-3 text-sm flex items-center gap-2"
                >
                  <AlertCircle size={14} /> {s.original}
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-400">
                جميع الطلاب تم اختيارهم ولله الحمد.
              </li>
            )}
          </ul>
        </div>

        {insights.cliques.length > 0 && (
          <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm border-t-4 border-t-purple-500 md:col-span-2">
            <h4 className="font-bold text-purple-800 flex items-center gap-2 mb-4">
              <Grid size={20} /> مجموعات اجتماعية صغيرة (مثلثات)
            </h4>
            <p className="text-sm text-slate-500 mb-3">
              مجموعات مغلقة اختار أفرادها بعضهم البعض بشكل دائري:
            </p>
            <div className="flex flex-wrap gap-3">
              {insights.cliques.map((c, i) => (
                <div
                  key={i}
                  className="bg-purple-50 border border-purple-200 text-purple-800 p-3 rounded-lg text-sm flex gap-2 items-center"
                >
                  <span>{c[0]}</span> ⟷ <span>{c[1]}</span> ⟷{" "}
                  <span>{c[2]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {insights.alerts.length > 0 && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-slate-500 md:col-span-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <AlertTriangle size={20} /> تنبيهات وإشارات
            </h4>
            <ul className="space-y-2">
              {insights.alerts.map((alert, i) => (
                <li
                  key={i}
                  className="bg-slate-50 p-2 text-sm text-slate-700 rounded border-r-4 border-slate-400"
                >
                  {alert}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
