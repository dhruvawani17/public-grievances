"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { CheckCircle, MapPin, Clock } from "lucide-react";

interface Ticket {
  id: string;
  summary: string;
  location: string;
  department: string;
  created_at: string;
  resolved_at: string; // Assuming this is set when status becomes 'Resolved'
}

export default function SolvedCasesPage() {
  const [resolvedTickets, setResolvedTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "tickets"), where("status", "==", "Resolved"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tickets: Ticket[] = [];
      querySnapshot.forEach((doc) => {
        tickets.push({ id: doc.id, ...doc.data() } as Ticket);
      });
      setResolvedTickets(tickets.sort((a, b) => new Date(b.resolved_at || b.created_at).getTime() - new Date(a.resolved_at || a.created_at).getTime()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-cyan-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Wall of Success</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Browse through the grievances successfully resolved by our dedicated teams.
          </p>
        </div>

        {resolvedTickets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-200">
            <h3 className="text-2xl font-medium text-gray-800">No Resolved Cases Yet</h3>
            <p className="mt-2 text-gray-500">Check back later to see a gallery of our successes!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resolvedTickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 transform hover:-translate-y-2 transition-transform duration-300">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      Resolved
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 h-14 overflow-hidden">{ticket.summary}</h3>
                  <div className="text-sm text-gray-500 space-y-2">
                    <p className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      {ticket.location}
                    </p>
                    <p className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                      Resolved on {new Date(ticket.resolved_at || ticket.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                     <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                        {ticket.department}
                      </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}