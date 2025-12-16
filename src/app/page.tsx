"use client";

import { useState, useEffect, FormEvent } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  createdAt: Timestamp;
}

export default function Home() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "guestbook"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newEntries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GuestbookEntry[];
      setEntries(newEntries);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "guestbook"), {
        name,
        message,
        createdAt: Timestamp.now(),
      });
      setName("");
      setMessage("");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error adding entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-100 dark:bg-gray-900">
      <div className="z-10 w-full max-w-2xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          Firebase Guestbook
        </h1>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
            />
            <textarea
              placeholder="Your Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="p-2 border rounded h-24 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
            >
              {loading ? "Sending..." : "Sign Guestbook"}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{entry.name}</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {entry.createdAt?.toDate().toLocaleString()}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{entry.message}</p>
            </div>
          ))}
          {entries.length === 0 && (
            <p className="text-center text-gray-500">No entries yet. Be the first!</p>
          )}
        </div>
      </div>
      <footer className="mt-8 text-xs text-gray-500">
        <p>Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "Not Set"}</p>
      </footer>
    </main>
  );
}
