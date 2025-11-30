"use client";

import { useMemo, useState, useCallback } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Field, FieldContent, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { useAuth } from "@/context/AuthContext";
import { OwnerCompanyContactSheet } from "@/components/features/empresas/owner-company-contact-sheet";
import { CompanyHeader } from "@/components/features/empresas/components/company-header";
import { CompanyLimits } from "@/components/features/empresas/components/company-limits";
import { ActivityToggle } from "@/components/features/empresas/components/activity-toggle";
import { LabelEditorCard } from "@/components/features/empresas/components/label-editor-card";
import { MessageEditorCard } from "@/components/features/empresas/components/message-editor-card";
import { EditFieldDialog } from "@/components/features/empresas/components/edit-field-dialog";
import { useCompanyConfig } from "@/hooks/company/useCompanyConfig";
import { LABEL_GROUPS, MESSAGE_FIELDS, REMINDER_MESSAGE_FIELD, ACTIVITY_TOGGLES } from "@/components/features/empresas/constants";
import { CompanyConfigData } from "@/types/company";

type ToggleKey = "requiere_domicilio" | "requiere_url" | "requiere_fecha_final";

export function OwnerCompanySettingsCard() {
  const { companyConfig, refreshCompanyConfig } = useAuth();
  const { updateToggle, updateField } = useCompanyConfig();
  
  const [openContact, setOpenContact] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [openActivities, setOpenActivities] = useState(false);
  const [isUpdatingToggle, setIsUpdatingToggle] = useState<ToggleKey | null>(null);
  const [openLabels, setOpenLabels] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [isSavingField, setIsSavingField] = useState(false);

  const contactValues = useMemo(
    () => ({
      company_phone: companyConfig?.company?.company_phone || "",
      company_email: companyConfig?.company?.company_email || "",
      company_whatsapp: companyConfig?.company?.company_whatsapp || "",
      company_telegram: companyConfig?.company?.company_telegram || "",
    }),
    [companyConfig]
  );

  const togglesState = useMemo(
    () => ({
      requiere_domicilio: companyConfig?.requiere_domicilio === 1,
      requiere_url: companyConfig?.requiere_url === 1,
      requiere_fecha_final: companyConfig?.requiere_fecha_final === 1,
    }),
    [companyConfig]
  );

  const handleToggle = useCallback(
    async (key: ToggleKey, next: boolean) => {
      if (isUpdatingToggle !== null) return;
      const current = togglesState[key];
      if (current === next) return;

      try {
        setIsUpdatingToggle(key);
        await updateToggle(key, next);
        await refreshCompanyConfig();
      } catch {
      } finally {
        setIsUpdatingToggle(null);
      }
    },
    [isUpdatingToggle, togglesState, updateToggle, refreshCompanyConfig]
  );

  const handleEditField = useCallback(
    async (key: string, value: string) => {
      try {
        setIsSavingField(true);
        await updateField(key, value);
        await refreshCompanyConfig();
        setEditingKey(null);
      } catch {
      } finally {
        setIsSavingField(false);
      }
    },
    [updateField, refreshCompanyConfig]
  );

  const handleStartEdit = useCallback((key: string, currentValue: string | number | undefined) => {
    setEditingKey(key);
    setEditingValue(String(currentValue || ""));
  }, []);

  const messageFields = useMemo(() => {
    const baseFields: Array<{ key: string; label: string; desc: string }> = [...MESSAGE_FIELDS];
    if (companyConfig?.company?.reminder_manual === 1) {
      baseFields.push(REMINDER_MESSAGE_FIELD);
    }
    return baseFields;
  }, [companyConfig?.company?.reminder_manual]);

  return (
    <>
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-2xl">Configuración principal</CardTitle>
          <CardDescription>Datos de la organización y contacto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="pb-4 mb-5">
            <div className="flex flex-col gap-4">
              <CompanyHeader companyConfig={companyConfig} />
              <CompanyLimits companyConfig={companyConfig} />
              <span className="text-sm text-muted-foreground italic">
                Si necesitas ampliar estos límites, no dudes en contactar a tu administrador para obtener planes adicionales y actualizaciones
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-5 pb-5">
            <div>
              <CardTitle className="text-2xl">Información de contacto</CardTitle>
              <CardDescription>
                Estos datos se utilizan para contactar a la empresa y para el envío de notificaciones.
              </CardDescription>
            </div>
            <Collapsible open={openContact} onOpenChange={setOpenContact}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  {openContact ? "Ocultar" : "Mostrar"}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
          <Separator />

          <Collapsible open={openContact}>
            <CollapsibleContent>
              <div className="pt-2 pb-5">
                <FieldSet className="pt-0">
                  <FieldGroup>
                    <Field className="gap-0.5">
                      <FieldLabel>Email de la empresa</FieldLabel>
                      <FieldContent>
                        <p className="text-sm">{contactValues.company_email || "-"}</p>
                      </FieldContent>
                    </Field>
                    <Field className="gap-0.5">
                      <FieldLabel>Teléfono</FieldLabel>
                      <FieldContent>
                        <p className="text-sm">{contactValues.company_phone || "-"}</p>
                      </FieldContent>
                    </Field>
                    <Field className="gap-0.5">
                      <FieldLabel>WhatsApp</FieldLabel>
                      <FieldContent>
                        <p className="text-sm">{contactValues.company_whatsapp || "-"}</p>
                      </FieldContent>
                    </Field>
                    <Field className="gap-0.5">
                      <FieldLabel>Telegram</FieldLabel>
                      <FieldContent>
                        <p className="text-sm">{contactValues.company_telegram || "-"}</p>
                      </FieldContent>
                    </Field>
                  </FieldGroup>
                  <div className="flex justify-end pt-0">
                    <Button onClick={() => setIsEditOpen(true)}>Editar Datos</Button>
                  </div>
                </FieldSet>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          <div className="flex items-center justify-between mt-5 pb-5">
            <div>
              <CardTitle className="text-2xl">Gestión de actividades</CardTitle>
              <CardDescription>
                Esta configuración inicial define algunas características básicas de la gestión de actividades/reclamos.
              </CardDescription>
            </div>
            <Collapsible open={openActivities} onOpenChange={setOpenActivities}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  {openActivities ? "Ocultar" : "Mostrar"}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
          <Separator />

          <Collapsible open={openActivities}>
            <CollapsibleContent>
              <div className="pt-2 pb-5">
                <div className="grid grid-cols-1 gap-4">
                  {ACTIVITY_TOGGLES.map((toggle) => (
                    <ActivityToggle
                      key={toggle.key}
                      toggleKey={toggle.key}
                      label={toggle.label}
                      description={toggle.description}
                      checked={togglesState[toggle.key]}
                      disabled={isUpdatingToggle === toggle.key}
                      onCheckedChange={(checked) => handleToggle(toggle.key, checked)}
                      companyConfig={companyConfig}
                    />
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          <div className="flex items-center justify-between mt-5 pb-5">
            <div>
              <CardTitle className="text-2xl">Personalización de etiquetas y mensajes</CardTitle>
              <CardDescription>Define cómo se nombran los roles y textos de notificaciones.</CardDescription>
            </div>
            <Collapsible open={openLabels} onOpenChange={setOpenLabels}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  {openLabels ? "Ocultar" : "Mostrar"}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
          <Separator />

          <Collapsible open={openLabels}>
            <CollapsibleContent>
              <div className="pt-2 pb-5">
                <CardDescription className="pb-4">Títulos personalizados</CardDescription>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {LABEL_GROUPS.map((item) => {
                    const singValue =
                      (companyConfig?.[item.sing.key as keyof CompanyConfigData] as string) || "";
                    const pluValue =
                      (companyConfig?.[item.plu.key as keyof CompanyConfigData] as string) || "";
                    return (
                      <LabelEditorCard
                        key={item.group}
                        group={item.group}
                        singKey={item.sing.key}
                        pluKey={item.plu.key}
                        singValue={singValue}
                        pluValue={pluValue}
                        onEditSingular={() => handleStartEdit(item.sing.key, singValue)}
                        onEditPlural={() => handleStartEdit(item.plu.key, pluValue)}
                      />
                    );
                  })}
                </div>

                <CardDescription className="pt-4">Notificaciones personalizadas</CardDescription>
                <div className="grid grid-cols-1 gap-4 mt-4">
                  {messageFields.map((item) => {
                    const value = (companyConfig?.[item.key as keyof CompanyConfigData] as string) || "";
                    return (
                      <MessageEditorCard
                        key={item.key}
                        label={item.label}
                        description={item.desc}
                        value={value}
                        onEdit={() => handleStartEdit(item.key, value)}
                      />
                    );
                  })}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <OwnerCompanyContactSheet
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            values={contactValues}
            onSaved={refreshCompanyConfig}
          />

          <EditFieldDialog
            isOpen={editingKey !== null}
            fieldKey={editingKey}
            value={editingValue}
            isSaving={isSavingField}
            onClose={() => {
              if (!isSavingField) {
                setEditingKey(null);
              }
            }}
            onValueChange={setEditingValue}
            onSave={() => {
              if (editingKey) {
                handleEditField(editingKey, editingValue);
              }
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
