"use client";

import { useState } from "react";

const Competence = () => {
  const [employees, setEmployees] = useState([]);
  const [isEditingGlobal, setIsEditingGlobal] = useState(true);

  const addEmployee = () => {
    setEmployees((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        position: "",
        workSkills: "",
        trainingRecords: [],
        trainingPrinciples: [],
        securityCertificates: [],
        isEditing: true, // เริ่มต้นในโหมดแก้ไข
      },
    ]);
  };

  const updateEmployee = (id, key, value) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, [key]: value } : emp))
    );
  };

  const addFile = (id, key, file) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id ? { ...emp, [key]: [...emp[key], file] } : emp
      )
    );
  };

  const removeFile = (id, key, fileIndex) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id
          ? { ...emp, [key]: emp[key].filter((_, i) => i !== fileIndex) }
          : emp
      )
    );
  };

  const toggleEdit = (id) => {
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
      {/* ปุ่ม Save & Edit สำหรับหน้าทั้งหมด */}
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
        Clause 7: Competence
      </h1>

      <div className="space-y-8">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-300 relative"
          >
            {/* ปุ่ม Save/Edit ส่วนตัวของแต่ละพนักงาน */}
            <button
              className={`absolute top-3 right-12 px-3 py-1 rounded-md shadow transition ${
                emp.isEditing
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-yellow-500 text-white hover:bg-yellow-600"
              }`}
              onClick={() => toggleEdit(emp.id)}
            >
              {emp.isEditing ? "Save" : "Edit"}
            </button>

            {/* ปุ่มลบพนักงาน */}
            <button
              className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
              onClick={() => removeEmployee(emp.id)}
            >
              ❌
            </button>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={emp.name}
                disabled={!emp.isEditing}
                onChange={(e) => updateEmployee(emp.id, "name", e.target.value)}
                className={`border p-2 rounded-md bg-gray-50 ${
                  emp.isEditing ? "border-gray-300" : "border-transparent"
                }`}
                placeholder="ชื่อพนักงาน"
              />
              <input
                type="text"
                value={emp.position}
                disabled={!emp.isEditing}
                onChange={(e) =>
                  updateEmployee(emp.id, "position", e.target.value)
                }
                className={`border p-2 rounded-md bg-gray-50 ${
                  emp.isEditing ? "border-gray-300" : "border-transparent"
                }`}
                placeholder="ตำแหน่งงาน"
              />
            </div>

            <FileUploadRow
              label="ทักษะการทำงาน"
              disabled={!emp.isEditing}
              onFileUpload={(file) => addFile(emp.id, "workSkills", file)}
            />

            <FileUploadRow
              label="บันทึกการฝึกอบรมของพนักงาน"
              disabled={!emp.isEditing}
              onFileUpload={(file) => addFile(emp.id, "trainingRecords", file)}
            />

            {/* หลักการฝึกอบรมที่ได้รับ */}
            {emp.trainingPrinciples.map((file, index) => (
              <FileUploadRow
                key={index}
                label="หลักการฝึกอบรมที่ได้รับ"
                uploadedFile={file}
                disabled={!emp.isEditing}
                onRemove={() => removeFile(emp.id, "trainingPrinciples", index)}
              />
            ))}

            <button
              className="px-4 py-1 bg-gray-600 text-white rounded-md shadow hover:bg-gray-700 transition mt-4"
              onClick={() =>
                addFile(emp.id, "trainingPrinciples", "Uploaded Training Principle")
              }
              disabled={!emp.isEditing}
            >
              Add Training Principle
            </button>

            {/* ใบรับรองด้านความปลอดภัยข้อมูลที่ถือครอง */}
            {emp.securityCertificates.map((file, index) => (
              <FileUploadRow
                key={index}
                label="ใบรับรองด้านความปลอดภัยข้อมูลที่สำคัญ"
                uploadedFile={file}
                disabled={!emp.isEditing}
                onRemove={() =>
                  removeFile(emp.id, "securityCertificates", index)
                }
              />
            ))}

            <button
              className="px-4 py-1 bg-gray-600 text-white rounded-md shadow hover:bg-gray-700 transition mt-4"
              onClick={() =>
                addFile(emp.id, "securityCertificates", "Uploaded Security Certificate")
              }
              disabled={!emp.isEditing}
            >
              Add Security Certificate
            </button>
          </div>
        ))}

        {/* ปุ่มเพิ่มพนักงาน */}
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded-md shadow hover:bg-purple-700 transition"
          onClick={addEmployee}
        >
          Add Employee
        </button>
      </div>
    </div>
  );
};

function FileUploadRow({ label, onFileUpload, uploadedFile, onRemove, disabled }) {
  return (
    <div className="mb-3">
      <label className="block text-gray-700">{label}</label>
      <div className="flex items-center space-x-3 mt-2">
        <input
          type="file"
          disabled={disabled}
          className="border p-2 rounded-md bg-gray-50 flex-grow"
          onChange={(e) => onFileUpload(e.target.files[0]?.name || "")}
        />
        {uploadedFile && <span className="text-gray-600">{uploadedFile}</span>}
        {uploadedFile && (
          <button
            className="px-3 py-1 bg-gray-600 text-white rounded-md shadow hover:bg-gray-700 transition"
            onClick={onRemove}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

export default Competence;
