import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Loader from "../components/Loader";

const Hostel = () => {
  const { user } = useAuth();
  const isAdmin = ["superadmin", "sectionadmin"].includes(user.role);

  const [rooms, setRooms] = useState([]);
  const [myAllocation, setMyAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roomForm, setRoomForm] = useState({ roomNumber: "", block: "", capacity: 2, roomType: "double" });
  const [allocateForm, setAllocateForm] = useState({ roomId: "", studentId: "" });

  const loadData = async () => {
    setLoading(true);
    try {
      const roomsRes = await api.get("/hostel/rooms");
      setRooms(roomsRes.data.rooms);
      if (user.role === "student") {
        const allocRes = await api.get("/hostel/my-allocation");
        setMyAllocation(allocRes.data.allocation);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddRoom = async (e) => {
    e.preventDefault();
    await api.post("/hostel/rooms", roomForm);
    setRoomForm({ roomNumber: "", block: "", capacity: 2, roomType: "double" });
    loadData();
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    await api.post("/hostel/allocate", allocateForm);
    setAllocateForm({ roomId: "", studentId: "" });
    loadData();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="section-title">Hostel</h2>
        <p className="text-navy/60 text-sm mt-1">Room inventory, occupancy, and allocation records.</p>
      </div>

      {user.role === "student" && (
        <div className="card">
          <h3 className="font-display text-lg text-navy mb-2">Your room</h3>
          {myAllocation ? (
            <p className="text-sm text-navy/70">
              Room <strong>{myAllocation.room?.roomNumber}</strong>, Block {myAllocation.room?.block} ·
              Allocated on {new Date(myAllocation.allocatedDate).toLocaleDateString()}
            </p>
          ) : (
            <p className="text-sm text-navy/50">You have not been allocated a hostel room yet.</p>
          )}
        </div>
      )}

      {isAdmin && (
        <div className="grid md:grid-cols-2 gap-4">
          <form onSubmit={handleAddRoom} className="card space-y-3">
            <h3 className="font-display text-lg text-navy">Add a room</h3>
            <div className="grid grid-cols-2 gap-3">
              <input className="input-field" placeholder="Room number" value={roomForm.roomNumber}
                onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })} required />
              <input className="input-field" placeholder="Block (e.g. A)" value={roomForm.block}
                onChange={(e) => setRoomForm({ ...roomForm, block: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="input-field" type="number" min={1} placeholder="Capacity" value={roomForm.capacity}
                onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })} />
              <select className="input-field" value={roomForm.roomType}
                onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="dormitory">Dormitory</option>
              </select>
            </div>
            <button className="btn-accent" type="submit">Add room</button>
          </form>

          <form onSubmit={handleAllocate} className="card space-y-3">
            <h3 className="font-display text-lg text-navy">Allocate a student</h3>
            <select className="input-field" value={allocateForm.roomId}
              onChange={(e) => setAllocateForm({ ...allocateForm, roomId: e.target.value })} required>
              <option value="">Select room</option>
              {rooms.filter((r) => r.status !== "full").map((r) => (
                <option key={r._id} value={r._id}>
                  {r.roomNumber} - Block {r.block} ({r.occupants.length}/{r.capacity})
                </option>
              ))}
            </select>
            <input className="input-field" placeholder="Student ID" value={allocateForm.studentId}
              onChange={(e) => setAllocateForm({ ...allocateForm, studentId: e.target.value })} required />
            <button className="btn-accent" type="submit">Allocate room</button>
          </form>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : (
        <div className="card">
          <h3 className="font-display text-lg text-navy mb-3">Room inventory</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-navy/50 border-b border-navy/10">
                  <th className="py-2 pr-4">Room</th>
                  <th className="py-2 pr-4">Block</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Occupancy</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r._id} className="border-b border-navy/5">
                    <td className="py-2 pr-4">{r.roomNumber}</td>
                    <td className="py-2 pr-4">{r.block}</td>
                    <td className="py-2 pr-4 capitalize">{r.roomType}</td>
                    <td className="py-2 pr-4">{r.occupants.length} / {r.capacity}</td>
                    <td className="py-2 pr-4 capitalize">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hostel;
