"use client";

import { useState } from "react";

const Doc = () => {
  const [documents, setDocuments] = useState([]);
  const [isEditingGlobal, setIsEditingGlobal] = useState(true);

  const addDocument = () => {
    setDocuments((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: "",
        category: "Policy",
        owner: "",
        version: "v1.0",
        lastUpdate: "",
        status: "Draft",
        reviewCycle: "6 เดือน",
        retentionPeriod: "1 ปี",
        file: null,
        isEditing: true,
      },
    ]);
  };

  const updateDocument = (id, key, value) => {
    if (value !== undefined) {
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === id ? { ...doc, [key]: value } : doc))
      );
    }
  };

  const toggleEditDocument = (id) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, isEditing: !doc.isEditing } : doc
      )
    );
  };

  const removeDocument = (id) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleFileUpload = (id, event) => {
    const file = event.target.files[0]?.name || "";
    updateDocument(id, "file", file);
  };

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      {/* ปุ่ม Save & Edit สำหรับทั้งหน้า */}
      <div className="flex justify-end mb-4">
        <button
          className={`px-4 py-2 rounded-md shadow transition ${
            isEditingGlobal
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-yellow-500 text-white hover:bg-yellow-600"
          }`}
          onClick={() => setIsEditingGlobal(!isEditingGlobal)}
        >
          {isEditingGlobal ? "Save All" : "Edit All"}
        </button>
      </div>

      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Clause 7: Documented Information
      </h1>

      <div className="space-y-8">
        {/* หมวดเอกสาร */}
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-300 relative"
          >
            {/* ปุ่ม Save/Edit ส่วนตัวของแต่ละเอกสาร */}
            <button
              className={`absolute top-3 right-10 px-3 py-1 rounded-md shadow transition ${
                doc.isEditing
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-yellow-500 text-white hover:bg-yellow-600"
              }`}
              onClick={() => toggleEditDocument(doc.id)}
            >
              {doc.isEditing ? "Save" : "Edit"}
            </button>

            {/* ปุ่มลบรายการเอกสาร */}
            <button
              className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
              onClick={() => removeDocument(doc.id)}
            >
              Remove
            </button>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={doc.title}
                disabled={!doc.isEditing}
                onChange={(e) =>
                  updateDocument(doc.id, "title", e.target.value)
                }
                className="border p-2 rounded-md bg-gray-50"
                placeholder="ชื่อเอกสาร"
              />
              <select
                value={doc.category}
                disabled={!doc.isEditing}
                onChange={(e) =>
                  updateDocument(doc.id, "category", e.target.value)
                }
                className="border p-2 rounded-md bg-gray-50"
              >
                <option value="Policy">Policy</option>
                <option value="Procedure">Procedure</option>
                <option value="Record">Record</option>
                <option value="Report">Report</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={doc.owner}
                disabled={!doc.isEditing}
                onChange={(e) =>
                  updateDocument(doc.id, "owner", e.target.value)
                }
                className="border p-2 rounded-md bg-gray-50"
                placeholder="เจ้าของเอกสาร"
              />
              <input
                type="text"
                value={doc.version}
                disabled={!doc.isEditing}
                onChange={(e) =>
                  updateDocument(doc.id, "version", e.target.value)
                }
                className="border p-2 rounded-md bg-gray-50"
                placeholder="เวอร์ชันเอกสาร"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="date"
                value={doc.lastUpdate}
                disabled={!doc.isEditing}
                onChange={(e) =>
                  updateDocument(doc.id, "lastUpdate", e.target.value)
                }
                className="border p-2 rounded-md bg-gray-50"
              />
              <select
                value={doc.status}
                disabled={!doc.isEditing}
                onChange={(e) =>
                  updateDocument(doc.id, "status", e.target.value)
                }
                className="border p-2 rounded-md bg-gray-50"
              >
                <option>Draft</option>
                <option>Approved</option>
                <option>Retired</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <select
                value={doc.reviewCycle}
                disabled={!doc.isEditing}
                onChange={(e) =>
                  updateDocument(doc.id, "reviewCycle", e.target.value)
                }
                className="border p-2 rounded-md bg-gray-50"
              >
                <option>6 เดือน</option>
                <option>1 ปี</option>
                <option>2 ปี</option>
              </select>
              <select
                value={doc.retentionPeriod}
                disabled={!doc.isEditing}
                onChange={(e) =>
                  updateDocument(doc.id, "retentionPeriod", e.target.value)
                }
                className="border p-2 rounded-md bg-gray-50"
              >
                <option>1 ปี</option>
                <option>5 ปี</option>
                <option>10 ปี</option>
              </select>
            </div>

            {/* File Upload */}
            <FileUploadRow
              uploadedFile={doc.file}
              disabled={!doc.isEditing}
              onUpload={(e) => handleFileUpload(doc.id, e)}
            />
          </div>
        ))}

        <button
          className="px-4 py-1 bg-purple-600 text-white rounded-md shadow hover:bg-purple-700 transition"
          onClick={addDocument}
        >
          Add Document
        </button>
      </div>
    </div>
  );
};

// Component อัปโหลดไฟล์
function FileUploadRow({ uploadedFile, onUpload, disabled }) {
  return (
    <div className="mb-3 flex items-center space-x-3">
      <input
        type="file"
        className="border p-2 rounded-md bg-gray-50 flex-grow"
        disabled={disabled}
        onChange={onUpload}
      />
      {uploadedFile && <span className="text-gray-600">{uploadedFile}</span>}
    </div>
  );
}

export default Doc;
