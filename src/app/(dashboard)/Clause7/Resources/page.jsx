"use client";

import { useState } from "react";
import VerticalNav, { Menu, MenuItem, SubMenu } from '@menu/vertical-menu'

const Resources = () =>{
  const [resources, setResources] = useState({
    organizations: [],
    departments: [],
    itSystems: [],
    financialResources: [],
  });

  const addResource = (type) => {
    setResources((prev) => ({
      ...prev,
      [type]: [...prev[type], { id: Date.now(), value: "", file: "" }],
    }));
  };

  const updateResource = (type, id, key, value) => {
    setResources((prev) => ({
      ...prev,
      [type]: prev[type].map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      ),
    }));
  };

  const removeResource = (type, id) => {
    setResources((prev) => ({
      ...prev,
      [type]: prev[type].filter((item) => item.id !== id),
    }));
  };

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Clause 7: Resources
      </h1>

      <div className="space-y-8">
        {/* ชื่อองค์กร */}
        <Section title="ชื่อองค์กร">
          {resources.organizations.map((org) => (
            <InputRow
              key={org.id}
              value={org.value}
              onChange={(e) =>
                updateResource("organizations", org.id, "value", e.target.value)
              }
              onRemove={() => removeResource("organizations", org.id)}
            />
          ))}
          <ActionButtons
            onAdd={() => addResource("organizations")}
            onSave={() => console.log("Save Organizations", resources.organizations)}
          />
        </Section>

        {/* หน่วยงานที่รับผิดชอบ + จำนวนบุคลากร */}
        <Section title="หน่วยงานที่รับผิดชอบ">
          {resources.departments.map((dept) => (
            <TwoColumnInputRow
              key={dept.id}
              valueLeft={dept.value}
              valueRight={dept.peopleCount}
              onChangeLeft={(e) =>
                updateResource("departments", dept.id, "value", e.target.value)
              }
              onChangeRight={(e) =>
                updateResource("departments", dept.id, "peopleCount", e.target.value)
              }
              onRemove={() => removeResource("departments", dept.id)}
            />
          ))}
          <ActionButtons
            onAdd={() => addResource("departments")}
            onSave={() => console.log("Save Departments", resources.departments)}
          />
        </Section>

        {/* เครื่องมือที่ใช้ + Upload File */}
        <Section title="เครื่องมือที่ใช้">
          {resources.itSystems.map((sys) => (
            <FileUploadRow
              key={sys.id}
              value={sys.value}
              file={sys.file}
              placeholder="IT asset Inventory"
              onChangeValue={(e) =>
                updateResource("itSystems", sys.id, "value", e.target.value)
              }
              onChangeFile={(e) =>
                updateResource("itSystems", sys.id, "file", e.target.files[0]?.name || "")
              }
              onRemove={() => removeResource("itSystems", sys.id)}
            />
          ))}
          <ActionButtons
            onAdd={() => addResource("itSystems")}
            onSave={() => console.log("Save IT Systems", resources.itSystems)}
          />
        </Section>

        {/* ทรัพยากรทางการเงิน + Upload File */}
        <Section title="ทรัพยากรทางการเงิน">
          {resources.financialResources.map((fin) => (
            <FileUploadRow
              key={fin.id}
              value={fin.value}
              file={fin.file}
              placeholder="Budget Report"
              onChangeValue={(e) =>
                updateResource("financialResources", fin.id, "value", e.target.value)
              }
              onChangeFile={(e) =>
                updateResource("financialResources", fin.id, "file", e.target.files[0]?.name || "")
              }
              onRemove={() => removeResource("financialResources", fin.id)}
            />
          ))}
          <ActionButtons
            onAdd={() => addResource("financialResources")}
            onSave={() => console.log("Save Financial Resources", resources.financialResources)}
          />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-300">
      <h2 className="font-semibold text-lg text-gray-700 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function InputRow({ value, onChange, onRemove }) {
  return (
    <div className="flex items-center space-x-3 mb-3">
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="border p-2 rounded-md flex-grow bg-gray-50"
        placeholder="Enter value"
      />
      <button className="px-3 py-1 bg-gray-600 text-white rounded-md shadow hover:bg-gray-700 transition" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}

function TwoColumnInputRow({ valueLeft, valueRight, onChangeLeft, onChangeRight, onRemove }) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-3">
      <input type="text" value={valueLeft} onChange={onChangeLeft} className="border p-2 rounded-md bg-gray-50" placeholder="หน่วยงานที่รับผิดชอบ" />
      <div className="flex space-x-2">
        <input type="text" value={valueRight} onChange={onChangeRight} className="border p-2 rounded-md bg-gray-50 flex-grow" placeholder="จำนวนบุคลากร" />
        <button className="px-3 py-1 bg-gray-600 text-white rounded-md shadow hover:bg-gray-700 transition" onClick={onRemove}>
          Remove
        </button>
      </div>
    </div>
  );
}

function FileUploadRow({ value, file, onChangeValue, onChangeFile, onRemove, placeholder }) {
  return (
    <div className="mb-3">
      <input type="text" value={value} onChange={onChangeValue} className="border p-2 rounded-md flex-grow bg-gray-50" placeholder={placeholder} />
      <div className="flex items-center space-x-3 mt-2">
        <input type="file" onChange={onChangeFile} className="border p-2 rounded-md bg-gray-50 flex-grow" />
        {file && <span className="text-gray-600">{file}</span>}
        <button className="px-3 py-1 bg-gray-600 text-white rounded-md shadow hover:bg-gray-700 transition" onClick={onRemove}>
          Remove
        </button>
      </div>
    </div>
  );
}

function ActionButtons({ onAdd, onSave }) {
  return (
    <div className="flex space-x-3 mt-3">
      <button className="px-4 py-1 bg-purple-600 text-white rounded-md shadow hover:bg-purple-700 transition" onClick={onAdd}>
        Add
      </button>
      <button className="px-4 py-1 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition" onClick={onSave}>
        Save
      </button>
    </div>
  );
};

export default Resources

;
