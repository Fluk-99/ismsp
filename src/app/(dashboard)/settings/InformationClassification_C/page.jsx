'use client';

import { useEffect, useState } from 'react';
import { TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import CancelIcon from '@mui/icons-material/Cancel';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'http://192.168.0.119:3000/api/settings/information-classification';

const InformationClassification_C = () => {
    const [classifications, setClassifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [canAdd, setCanAdd] = useState(true);

    useEffect(() => {
        fetchClassifications();
    }, []);

    // ดึงข้อมูลจาก API
    const fetchClassifications = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error("Failed to fetch data");

            const data = await response.json();
            setClassifications(data.data.map((cls) => ({
                id: cls._id, // ใช้ `_id` จาก MongoDB
                label: cls.label,
                description: cls.description,
                isEditable: false,
                isSaved: true,
            })));
        } catch (error) {
            toast.error("Failed to fetch classifications.");
        } finally {
            setLoading(false);
        }
    };

    // เปิด/ปิดโหมดแก้ไข
    const handleEditToggle = (id) => {
        setClassifications((prev) =>
            prev.map((cls) => (cls.id === id ? { ...cls, isEditable: !cls.isEditable, isSaved: false } : cls))
        );
        setCanAdd(true);
    };

    // บันทึกข้อมูลใหม่ไปยัง API
    const handleSaveToAPI = async (id) => {
      const cls = classifications.find((cls) => cls.id === id);

      if (!cls || !cls.label.trim() || !cls.description.trim()) {
          toast.error('Please fill in all fields before saving!');
          return;
      }

      try {
          let url = `${API_URL}/create`;
          let method = "POST";
          let body = JSON.stringify({
              label: cls.label,
              description: cls.description,
          });

          // ถ้ามี id (ไม่ใช่ temp) แสดงว่าเป็นการแก้ไข ให้ใช้ PUT
          if (!cls.id.startsWith("temp-")) {
              url = `${API_URL}/${cls.id}`;
              method = "PUT";
          }

          console.log("Saving Data:", body);

          const response = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body
          });

          if (!response.ok) {
              const errorResponse = await response.json();
              console.error("Save Error:", errorResponse);
              throw new Error(`Failed to save classification: ${errorResponse.message}`);
          }

          toast.success('Classification saved successfully!');
          fetchClassifications();
          setCanAdd(true);
      } catch (error) {
          toast.error('Failed to save classification.');
          console.error("Error:", error);
      }
  };


    // เพิ่ม Classification ใหม่
    const handleAddClassification = () => {
        setClassifications((prev) => [
            ...prev,
            {
                id: `temp-${Date.now()}`,
                label: '',
                description: '',
                isEditable: true,
                isSaved: false
            }
        ]);
        setCanAdd(false);
    };

    // ยกเลิกการเพิ่ม
    const handleCancelAdd = () => {
        setClassifications(prev => prev.filter(cls => !cls.id.startsWith("temp-")));
        setCanAdd(true);
    };

    // ลบ Classification
    const handleDeleteClassification = async (clsId) => {
        try {
            const response = await fetch(`${API_URL}/${clsId}`, { method: "DELETE" });
            if (!response.ok) throw new Error(`Failed to delete classification (${response.status})`);

            toast.success("Classification deleted successfully!");
            await fetchClassifications();
        } catch (error) {
            toast.error('Failed to delete classification.');
        }
    };

    return (
        <Box sx={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <ToastContainer />

            <Typography variant='h4' align='center' gutterBottom>
                Information Classification
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <CircularProgress />
                </Box>
            ) : (
                classifications.map((cls) => (
                    <Box key={cls.id} sx={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
                        <TextField
                            fullWidth
                            label='Label'
                            value={cls.label}
                            disabled={!cls.isEditable}
                            onChange={(e) => setClassifications((prev) =>
                                prev.map((c) => (c.id === cls.id ? { ...c, label: e.target.value } : c))
                            )}
                        />

                        <TextField
                            fullWidth
                            label='Description'
                            value={cls.description}
                            disabled={!cls.isEditable}
                            onChange={(e) => setClassifications((prev) =>
                                prev.map((c) => (c.id === cls.id ? { ...c, description: e.target.value } : c))
                            )}
                        />

                        <Button variant='contained' color='secondary' onClick={() => handleEditToggle(cls.id)}>
                            {cls.isEditable ? 'Cancel' : 'Edit'}
                        </Button>

                        <Button
                            variant='contained'
                            color='primary'
                            onClick={() => handleSaveToAPI(cls.id)}
                            disabled={!cls.isEditable || !cls.label.trim() || !cls.description.trim()}
                        >
                            Save
                        </Button>

                        <Button variant='contained' color='error' onClick={() => handleDeleteClassification(cls.id)}>
                            Delete
                        </Button>
                    </Box>
                ))
            )}

            {canAdd ? (
                <Box sx={{ textAlign: "center", marginTop: "20px" }}>
                    <Button variant="contained" color="success" onClick={handleAddClassification}>
                        Add Classification
                    </Button>
                </Box>
            ) : (
                <Box sx={{ textAlign: "center", marginTop: "20px" }}>
                    <Button variant="contained" color="error" startIcon={<CancelIcon />} onClick={handleCancelAdd}>
                        Cancel Add
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default InformationClassification_C;
