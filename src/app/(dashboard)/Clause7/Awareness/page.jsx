"use client";

import { useState } from "react";

const Awareness = () => {
  const [awarenessFiles, setAwarenessFiles] = useState({
    trainingTopics: [],
    securityAwareness: [],
    trainingPlans: [],
    responseGuidelines: [],
    alertDocuments: [],
  });

  const [employees, setEmployees] = useState([]);
  const [isEditingGlobal, setIsEditingGlobal] = useState(true);

  const addFile = (category, file) => {
    setAwarenessFiles((prev) => ({
      ...prev,
      [category]: [...prev[category], file],
    }));
  };

  const removeFile = (category, index) => {
    setAwarenessFiles((prev) => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  };

  const addEmployee = () => {
    setEmployees((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        organizationTraining: "",
        pastISMSTraining: "",
        trainingDate: "",
        isEditing: true,
      },
    ]);
  };

  const updateEmployee = (id, key, value) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, [key]: value } : emp))
    );
  };

  const toggleEditEmployee = (id) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id ? { ...emp, isEditing: !emp.isEditing } : emp
      )
    );
  };

  const removeEmployee = (id) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
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
        Clause 7: Awareness
      </h1>

      <div className="space-y-8">
        {/* หมวดการอัปโหลดไฟล์ */}
        {Object.keys(awarenessFiles).map((category, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-300"
          >
            <h2 className="font-semibold text-lg text-gray-700 mb-4">
              {getCategoryLabel(category)}
            </h2>

            {awarenessFiles[category].map((file, idx) => (
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

        {/* ส่วนของข้อมูลพนักงาน */}
        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-300">
          <h2 className="font-semibold text-lg text-gray-700 mb-4">
            ข้อมูลพนักงาน
          </h2>

          {employees.map((emp) => (
            <div key={emp.id} className="border p-4 rounded-lg mb-4 relative">
              <button
                className={`absolute top-2 right-10 px-3 py-1 rounded-md shadow transition ${
                  emp.isEditing
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-yellow-500 text-white hover:bg-yellow-600"
                }`}
                onClick={() => toggleEditEmployee(emp.id)}
              >
                {emp.isEditing ? "Save" : "Edit"}
              </button>

              <button
                className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                onClick={() => removeEmployee(emp.id)}
              >
                Remove
              </button>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <input
                  type="text"
                  value={emp.name}
                  disabled={!emp.isEditing}
                  onChange={(e) =>
                    updateEmployee(emp.id, "name", e.target.value)
                  }
                  className="border p-2 rounded-md bg-gray-50"
                  placeholder="ชื่อพนักงาน"
                />
                <input
                  type="text"
                  value={emp.organizationTraining}
                  disabled={!emp.isEditing}
                  onChange={(e) =>
                    updateEmployee(emp.id, "organizationTraining", e.target.value)
                  }
                  className="border p-2 rounded-md bg-gray-50"
                  placeholder="การอบรมที่องค์กรจัดให้พนักงาน"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={emp.pastISMSTraining}
                  disabled={!emp.isEditing}
                  onChange={(e) =>
                    updateEmployee(emp.id, "pastISMSTraining", e.target.value)
                  }
                  className="border p-2 rounded-md bg-gray-50"
                  placeholder="การอบรมด้าน ISMS ที่พนักงานเคยเข้าร่วม"
                />
                <input
                  type="date"
                  value={emp.trainingDate}
                  disabled={!emp.isEditing}
                  onChange={(e) =>
                    updateEmployee(emp.id, "trainingDate", e.target.value)
                  }
                  className="border p-2 rounded-md bg-gray-50"
                  placeholder="วันที่อบรม"
                />
              </div>
            </div>
          ))}

          <button
            className="px-4 py-1 bg-purple-600 text-white rounded-md shadow hover:bg-purple-700 transition"
            onClick={addEmployee}
          >
            Add Employee
          </button>
        </div>
      </div>
    </div>
  );
};

// ฟังก์ชันช่วยแปลงชื่อ category เป็นข้อความแสดงผล
function getCategoryLabel(category) {
  const labels = {
    trainingTopics: "หัวข้อการสอน",
    securityAwareness: "Security Awareness (คะแนนสอบ)",
    trainingPlans: "แผนฝึกอบรมเกี่ยวกับ Security Awareness",
    responseGuidelines: "แนวทางปฏิบัติเมื่อต้องเผชิญเหตุการณ์ผิดปกติ",
    alertDocuments: "เอกสารแจ้งเตือนภายในเกี่ยวกับภัยคุกคาม",
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

export default Awareness;
