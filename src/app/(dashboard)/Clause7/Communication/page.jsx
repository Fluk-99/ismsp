"use client";

import { useState } from "react";

const Communication = () => {
  const [communications, setCommunications] = useState([]);
  const [communicationFiles, setCommunicationFiles] = useState({
    ismsPlan: [],
    externalPolicy: [],
  });
  const [isEditingGlobal, setIsEditingGlobal] = useState(true);

  const addCommunication = () => {
    setCommunications((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: "",
        date: "",
        communicationType: "internal",
        channel: "",
        isEditing: true,
      },
    ]);
  };

  const updateCommunication = (id, key, value) => {
    setCommunications((prev) =>
      prev.map((comm) => (comm.id === id ? { ...comm, [key]: value } : comm))
    );
  };

  const removeCommunication = (id) => {
    setCommunications((prev) => prev.filter((comm) => comm.id !== id));
  };

  const toggleEditCommunication = (id) => {
    setCommunications((prev) =>
      prev.map((comm) =>
        comm.id === id ? { ...comm, isEditing: !comm.isEditing } : comm
      )
    );
  };

  const addFile = (category, file) => {
    setCommunicationFiles((prev) => ({
      ...prev,
      [category]: [...prev[category], file],
    }));
  };

  const removeFile = (category, index) => {
    setCommunicationFiles((prev) => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      {/* ปุ่ม Save & Edit สำหรับทั้งหน้า */}
      <div className="flex justify-end mb-4">
        <buttonF
          className={`px-4 py-2 rounded-md shadow transition ${
            isEditingGlobal
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-yellow-500 text-white hover:bg-yellow-600"
          }`}
          onClick={() => setIsEditingGlobal(!isEditingGlobal)}
        >
          {isEditingGlobal ? "Save All" : "Edit All"}
        </buttonF>
      </div>

      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Clause 7: Communication
      </h1>

      <div className="space-y-8">
        {/* หมวดข้อมูลการสื่อสาร */}
        {communications.map((comm) => (
          <div
            key={comm.id}
            className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-300 relative"
          >
            {/* ปุ่ม Save/Edit ส่วนตัวของแต่ละการสื่อสาร */}
            <button
              className={`absolute top-3 right-10 px-3 py-1 rounded-md shadow transition ${
                comm.isEditing
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-yellow-500 text-white hover:bg-yellow-600"
              }`}
              onClick={() => toggleEditCommunication(comm.id)}
            >
              {comm.isEditing ? "Save" : "Edit"}
            </button>

            {/* ปุ่มลบรายการการสื่อสาร */}
            <button
              className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
              onClick={() => removeCommunication(comm.id)}
            >
              Remove
            </button>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={comm.title}
                disabled={!comm.isEditing}
                onChange={(e) =>
                  updateCommunication(comm.id, "title", e.target.value)
                }
                className="border p-2 rounded-md bg-gray-50"
                placeholder="หัวข้อการสื่อสาร"
              />
              <input
                type="date"
                value={comm.date}
                disabled={!comm.isEditing}
                onChange={(e) =>
                  updateCommunication(comm.id, "date", e.target.value)
                }
                className="border p-2 rounded-md bg-gray-50"
                placeholder="วันที่สื่อสาร"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select
                value={comm.communicationType}
                disabled={!comm.isEditing}
                onChange={(e) =>
                  updateCommunication(
                    comm.id,
                    "communicationType",
                    e.target.value
                  )
                }
                className="border p-2 rounded-md bg-gray-50"
              >
                <option value="internal">
                  การสื่อสารภายใน (Internal Communication)
                </option>
                <option value="external">
                  การสื่อสารภายนอก (External Communication)
                </option>
              </select>
              <input
                type="text"
                value={comm.channel}
                disabled={!comm.isEditing}
                onChange={(e) =>
                  updateCommunication(comm.id, "channel", e.target.value)
                }
                className="border p-2 rounded-md bg-gray-50"
                placeholder="ช่องทางที่ใช้สื่อสาร"
              />
            </div>
          </div>
        ))}

        <button
          className="px-4 py-1 bg-purple-600 text-white rounded-md shadow hover:bg-purple-700 transition"
          onClick={addCommunication}
        >
          Add Communication
        </button>

        {/* หมวดการอัปโหลดไฟล์ */}
        {Object.keys(communicationFiles).map((category, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-300"
          >
            <h2 className="font-semibold text-lg text-gray-700 mb-4">
              {getCategoryLabel(category)}
            </h2>

            {communicationFiles[category].map((file, idx) => (
              <FileUploadRow
                key={idx}
                uploadedFile={file}
                disabled={!isEditingGlobal}
                onRemove={() => removeFile(category, idx)}
              />
            ))}

            <button
              className="px-4 py-1 bg-gray-600 text-white rounded-md shadow hover:bg-gray-700 transition mt-4"
              onClick={() => addFile(category, "Uploaded File")}
              disabled={!isEditingGlobal}
            >
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ฟังก์ชันช่วยแปลงชื่อ category เป็นข้อความแสดงผล
function getCategoryLabel(category) {
  const labels = {
    ismsPlan: "แผนการสื่อสารภายในเกี่ยวกับ ISMS",
    externalPolicy: "นโยบายการสื่อสารภายนอก",
  };
  return labels[category] || category;
}

// Component อัปโหลดไฟล์
function FileUploadRow({ uploadedFile, onRemove, disabled }) {
  return (
    <div className="mb-3 flex items-center space-x-3">
      <input type="file" className="border p-2 rounded-md bg-gray-50 flex-grow" disabled={disabled} />
      {uploadedFile && <span className="text-gray-600">{uploadedFile}</span>}
      {uploadedFile && (
        <button className="px-3 py-1 bg-gray-600 text-white rounded-md shadow hover:bg-gray-700 transition" onClick={onRemove}>
          Remove
        </button>
      )}
    </div>
  );
}

export default Communication;
