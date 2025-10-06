import React, { useState } from 'react';
import { Edit2, User } from 'react-feather';

import UpdateProfile from './UpdateProfile';

export default function ProfileEditButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="absolute top-2 right-16 flex items-center gap-2 bg-white border border-gray-300 rounded-full shadow px-4 py-2 hover:bg-gray-100 transition z-20"
        onClick={() => setOpen((prev) => !prev)}
        title="Editar perfil"
        type="button"
      >
        <User size={20} />
        <Edit2 size={18} />
      </button>
      {open && <UpdateProfile onClose={() => setOpen(false)} />}
    </>
  );
}
