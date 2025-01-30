import { Typography, Button } from "@mui/material";

export default function Section({ title, data, isEditable, onAdd, onRemove, renderItem }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      {data.map((item, index) => (
        <div key={index} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
          {renderItem(item, index)}
          {isEditable && (
            <Button variant="contained" color="secondary" onClick={() => onRemove(index)}>Remove</Button>
          )}
        </div>
      ))}
      {isEditable && (
        <Button variant="contained" color="primary" onClick={onAdd} style={{ marginTop: "10px" }}>
          Add {title.slice(0, -1)}
        </Button>
      )}
    </div>
  );
}
