import React from 'react';
import { useParams } from 'react-router-dom';
import NoticiaForm from '../components/NoticiaForm';

const AdminEditarNoticia = () => {
  const { id } = useParams();
  return <NoticiaForm mode="edit" id={id} />;
};

export default AdminEditarNoticia;
