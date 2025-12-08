"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import { Plus, Search, MapPin, User, Clock, XCircle, FileText, Image as ImageIcon, Upload, AlertCircle, CheckCircle } from "lucide-react";

interface Ticket {
  id: string;
  userId: string;
  citizen: {
    name: string;
    phone: string;
  };
  location: string;
  text: string;
  summary: string;
  department: string;
  priority: string;
  status: string;
  assignee: string;
  created_at: string;
  attachments: string[];
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Form state
  const [citizenName, setCitizenName] = useState("");
  const [citizenPhone, setCitizenPhone] = useState("");
  const [location, setLocation] = useState("");
  const [complaintText, setComplaintText] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Modal state
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          if (data && data.display_name) {
            setLocation(data.display_name);
          } else {
            setLocation(`Lat: ${latitude}, Lon: ${longitude}`);
          }
        } catch (error) {
          console.error("Error fetching address: ", error);
          setLocation(`Lat: ${latitude}, Lon: ${longitude}`);
          alert("Could not fetch address, but coordinates are set.");
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        console.error("Error getting location: ", error);
        alert("Unable to retrieve your location. Please enter it manually.");
        setIsFetchingLocation(false);
      }
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setCitizenName(user.displayName || "");
        setLoading(false);
        handleFetchLocation();
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "tickets"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userTickets: Ticket[] = [];
      querySnapshot.forEach((doc) => {
        userTickets.push({ id: doc.id, ...doc.data() } as Ticket);
      });
      setTickets(userTickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreateTicket = async () => {
    if (!user) {
      alert('You must be logged in to create a ticket.');
      return;
    }
    if (!complaintText.trim() || !citizenName.trim() || !location.trim() || !citizenPhone.trim()) {
      alert('Please fill all required fields: Name, Contact Phone, Location, and Complaint Description.');
      return;
    }
    if (citizenPhone.trim().length !== 10) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }

    setIsSubmitting(true);
    let attachmentUrl = "";

    try {
      if (file) {
        const storage = getStorage();
        const storageRef = ref(storage, `attachments/${user.uid}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        attachmentUrl = await getDownloadURL(snapshot.ref);
      }

      const summary = makeSummary(complaintText);
      const department = routeDepartment(complaintText + ' ' + (location || ''));
      
      const newTicketData: Omit<Ticket, 'id'> = {
        userId: user.uid,
        citizen: { name: citizenName.trim(), phone: citizenPhone.trim() },
        location: location.trim(),
        text: complaintText.trim(),
        summary,
        department,
        priority,
        status: 'Open',
        assignee: '',
        created_at: new Date().toISOString(),
        attachments: attachmentUrl ? [attachmentUrl] : []
      };

      const docRef = await addDoc(collection(db, "tickets"), newTicketData);
      
      // Reset form
      setLocation("");
      setComplaintText("");
      setPriority("Medium");
      setFile(null);
      
      alert('✅ Ticket created successfully! ID: ' + docRef.id);
    } catch (error) {
      console.error("Error creating ticket: ", error);
      alert('Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const makeSummary = (text: string) => {
    if (!text) return 'No description provided';
    const s = text.trim();
    return s.slice(0, 100) + (s.length > 100 ? '...' : '');
  };

  const routeDepartment = (text: string) => {
    text = (text || '').toLowerCase();
    if (/pothole|road/.test(text)) return 'Roads';
    if (/garbage|trash|dump|clean/.test(text)) return 'Sanitation';
    if (/water|leak|pipe|sewage/.test(text)) return 'Water';
    if (/electric|light|power/.test(text)) return 'Electricity';
    return 'General';
  };

  const filteredTickets = tickets.filter(t => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.id.toLowerCase().includes(q) ||
      t.text.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.location.toLowerCase().includes(q) ||
      t.department.toLowerCase().includes(q)
    );
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Grievances</h1>
          <p className="text-gray-600">Submit and track your civic complaints.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Plus className="h-4 w-4 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Submit New Complaint</h2>
              </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                  value={citizenName}
                  onChange={e => setCitizenName(e.target.value)}
                  readOnly={!!user?.displayName}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="98xxxxxxxx"
                  value={citizenPhone}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      setCitizenPhone(value);
                    }
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location of Issue</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 pr-10"
                    placeholder={isFetchingLocation ? "Fetching location..." : "e.g., Ward 7, near City Park"}
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    disabled={isFetchingLocation}
                  />
                  <button 
                    onClick={handleFetchLocation} 
                    disabled={isFetchingLocation}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-blue-600 disabled:opacity-50"
                  >
                    {isFetchingLocation ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Complaint Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-32 text-gray-900"
                  placeholder="Describe the issue in detail..."
                  value={complaintText}
                  onChange={e => setComplaintText(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">Attachment</label>
                  <label htmlFor="file-upload" className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                    {file ? <FileText className="h-4 w-4 text-blue-600 mr-2" /> : <Upload className="h-4 w-4 text-gray-500 mr-2" />}
                    <span className="text-sm text-gray-600 truncate">{file ? file.name : "Upload Image"}</span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleCreateTicket}
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 font-medium flex items-center justify-center disabled:opacity-50"
                >
                  {isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : "Submit Ticket"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="text-2xl font-bold text-gray-900">{tickets.length}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Tickets</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="text-2xl font-bold text-orange-600">{tickets.filter(t => t.status !== 'Resolved').length}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Active</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="text-2xl font-bold text-green-600">{tickets.filter(t => t.status === 'Resolved').length}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Resolved</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search your tickets..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
                <h3 className="text-lg font-medium">No tickets found.</h3>
                <p className="text-sm">Try adjusting your filters or submitting a new complaint.</p>
              </div>
            ) : (
              filteredTickets.map(ticket => (
                <div key={ticket.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-gray-900">{ticket.summary}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {ticket.location}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                          {ticket.department}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                          ticket.status === 'Resolved' 
                            ? 'bg-green-50 text-green-700 border-green-100' 
                            : ticket.status === 'In Progress'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
                            : 'bg-orange-50 text-orange-700 border-orange-100'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setSelectedTicket(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedTicket.id}</h3>
                <p className="text-sm text-gray-500">Created on {new Date(selectedTicket.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
                  <p className="font-medium">{selectedTicket.location}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                  <p className={`font-medium flex items-center ${
                    selectedTicket.status === 'Resolved' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {selectedTicket.status === 'Resolved' ? <CheckCircle className="h-4 w-4 mr-1.5" /> : <AlertCircle className="h-4 w-4 mr-1.5" />}
                    {selectedTicket.status}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Full Description</h4>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">{selectedTicket.text}</p>
              </div>

              {selectedTicket.attachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Attachments</h4>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {selectedTicket.attachments.map((src, i) => (
                      <a key={i} href={src} target="_blank" rel="noopener noreferrer">
                        <img src={src} alt={`Attachment ${i+1}`} className="h-32 w-auto rounded-lg border border-gray-200 object-cover hover:opacity-80 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedTicket.assignee && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-blue-800">Assigned To</h4>
                  <p className="text-sm text-blue-700">This case is being handled by: {selectedTicket.assignee}</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
              <button 
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
