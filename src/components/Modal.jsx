import { Dialog, DialogTitle, IconButton } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export default function Modal({ title, onClose, children }) {
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pr: 7, fontWeight: 750 }}>
        {title}
        <IconButton
          aria-label="Close"
          onClick={onClose}
          sx={{ position: "absolute", right: 12, top: 12, color: "text.secondary" }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      {children}
    </Dialog>
  );
}
