"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { ClienteRecurrenteFormData, ClienteRecurrenteUpdateData, ClienteRecurrente } from "@/types/clientes";

interface DireccionFields {
  calle: string;
  numero: string;
  ciudad: string;
  provincia: string;
  codigo_postal: string;
}

export function useClienteForm() {
  const { companyConfig } = useAuth();
  const [formData, setFormData] = useState<ClienteRecurrenteFormData>({
    cliente_complete_name: "",
    cliente_dni: "",
    cliente_phone: "",
    cliente_email: "",
    cliente_direccion: "",
  });

  const [direccionFields, setDireccionFields] = useState<DireccionFields>({
    calle: "",
    numero: "",
    ciudad: "",
    provincia: "",
    codigo_postal: "",
  });

  const buildDireccion = useCallback((fields: DireccionFields): string => {
    const partes: string[] = [];
    
    if (fields.calle.trim() && fields.numero.trim()) {
      partes.push(`${fields.calle.trim()} ${fields.numero.trim()}`);
    } else if (fields.calle.trim()) {
      partes.push(fields.calle.trim());
    }
    
    if (fields.ciudad.trim()) partes.push(fields.ciudad.trim());
    
    if (fields.provincia.trim()) {
      let provinciaNormalizada = fields.provincia.trim();
      if (provinciaNormalizada.includes("Ciudad Autonoma") || provinciaNormalizada.includes("Bs As")) {
        provinciaNormalizada = "Buenos Aires";
      }
      partes.push(provinciaNormalizada);
    }
    
    return partes.join(", ");
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      cliente_complete_name: "",
      cliente_dni: "",
      cliente_phone: "",
      cliente_email: "",
      cliente_direccion: "",
    });
    setDireccionFields({
      calle: "",
      numero: "",
      ciudad: "",
      provincia: "",
      codigo_postal: "",
    });
  }, []);

  const loadClienteData = useCallback((cliente: ClienteRecurrente) => {
    setFormData({
      cliente_complete_name: cliente.cliente_complete_name,
      cliente_dni: cliente.cliente_dni || "",
      cliente_phone: cliente.cliente_phone || "",
      cliente_email: cliente.cliente_email || "",
      cliente_direccion: cliente.cliente_direccion || "",
      cliente_lat: cliente.cliente_lat,
      cliente_lng: cliente.cliente_lng,
    });
  }, []);

  const validateForm = useCallback((isEditing: boolean): string | null => {
    if (!formData.cliente_complete_name.trim() ||
        !formData.cliente_dni.trim() ||
        !formData.cliente_phone.trim() ||
        !formData.cliente_email.trim()) {
      return "Los campos nombre, DNI, teléfono y email son obligatorios";
    }

    if (companyConfig?.requiere_domicilio === 1) {
      if (isEditing) {
        if (!formData.cliente_direccion?.trim()) {
          return "La dirección es obligatoria";
        }
      } else {
        if (!direccionFields.calle.trim() ||
            !direccionFields.numero.trim() ||
            !direccionFields.ciudad.trim() ||
            !direccionFields.provincia.trim()) {
          return "Los campos calle, número, ciudad y provincia son obligatorios";
        }
      }
    }

    return null;
  }, [formData, direccionFields, companyConfig]);

  const buildCreateData = useCallback((): ClienteRecurrenteFormData => {
    const direccionCompleta = buildDireccion(direccionFields) + ", Argentina";
    return {
      ...formData,
      cliente_direccion: direccionCompleta,
    };
  }, [formData, direccionFields, buildDireccion]);

  const buildUpdateData = useCallback((originalCliente: ClienteRecurrente): ClienteRecurrenteUpdateData => {
    const updateData: ClienteRecurrenteUpdateData = {};

    if (formData.cliente_complete_name !== originalCliente.cliente_complete_name) {
      updateData.cliente_complete_name = formData.cliente_complete_name;
    }
    if (formData.cliente_dni !== originalCliente.cliente_dni) {
      updateData.cliente_dni = formData.cliente_dni;
    }
    if (formData.cliente_phone !== originalCliente.cliente_phone) {
      updateData.cliente_phone = formData.cliente_phone;
    }
    if (formData.cliente_email !== originalCliente.cliente_email) {
      updateData.cliente_email = formData.cliente_email;
    }
    if (formData.cliente_direccion !== originalCliente.cliente_direccion) {
      updateData.cliente_direccion = formData.cliente_direccion;
    }
    if (formData.cliente_lat !== originalCliente.cliente_lat) {
      updateData.cliente_lat = formData.cliente_lat;
    }
    if (formData.cliente_lng !== originalCliente.cliente_lng) {
      updateData.cliente_lng = formData.cliente_lng;
    }

    return updateData;
  }, [formData]);

  return {
    formData,
    setFormData,
    direccionFields,
    setDireccionFields,
    resetForm,
    loadClienteData,
    validateForm,
    buildCreateData,
    buildUpdateData,
  };
}

