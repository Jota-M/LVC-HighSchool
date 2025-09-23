"use client";
import { useEffect, useState, FormEvent } from "react";

interface Preinscripcion {
  id: number;
  nombre: string;
  edad: number;
  curso: string;
}

export default function Home() {
  const [data, setData] = useState<Preinscripcion[]>([]);
  const [form, setForm] = useState<Omit<Preinscripcion, "id">>({
    nombre: "",
    edad: 0,
    curso: "",
  });
  const [editId, setEditId] = useState<number | null>(null);

  // cargar datos
  const fetchData = async () => {
    const res = await fetch("http://localhost:3000/api/preinscripcion");
    const result: Preinscripcion[] = await res.json();
    setData(result);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // manejar creación/edición
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `http://localhost:3000/api/preinscripcion/${editId}`
      : "http://localhost:3000/api/preinscripcion";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setForm({ nombre: "", edad: 0, curso: "" });
    setEditId(null);
    fetchData();
  };

  // eliminar
  const handleDelete = async (id: number) => {
    await fetch(`http://localhost:3000/api/preinscripcion/${id}`, {
      method: "DELETE",
    });
    fetchData();
  };

  // activar edición
  const handleEdit = (p: Preinscripcion) => {
    setForm({ nombre: p.nombre, edad: p.edad, curso: p.curso });
    setEditId(p.id);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 text-blue-600">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        📋 Preinscripciones
      </h1>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 mb-8 w-full max-w-md space-y-4"
      >
        <input
          type="text"
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          className="w-full border rounded-lg p-2 "
          required
        />
        <input
          type="number"
          placeholder="Edad"
          value={form.edad || ""}
          onChange={(e) =>
            setForm({ ...form, edad: Number(e.target.value) || 0 })
          }
          className="w-full border rounded-lg p-2"
          required
        />
        <input
          type="text"
          placeholder="Curso"
          value={form.curso}
          onChange={(e) => setForm({ ...form, curso: e.target.value })}
          className="w-full border rounded-lg p-2"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          {editId ? "Actualizar" : "Agregar"}
        </button>
      </form>

      {/* Tabla */}
      <div className="overflow-x-auto w-full max-w-3xl">
        <table className="w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Edad</th>
              <th className="p-3 text-left">Curso</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-100">
                <td className="p-3">{p.id}</td>
                <td className="p-3">{p.nombre}</td>
                <td className="p-3">{p.edad}</td>
                <td className="p-3">{p.curso}</td>
                <td className="p-3 flex justify-center gap-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="px-3 py-1 bg-yellow-400 rounded hover:bg-yellow-500 text-white"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-3 py-1 bg-red-500 rounded hover:bg-red-600 text-white"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center p-4 text-gray-500 italic"
                >
                  No hay registros todavía
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
