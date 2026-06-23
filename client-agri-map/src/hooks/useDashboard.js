import { useEffect, useState } from "react";
import { agrimapApi } from "../lib/api";

export function useDashboard() {
  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const fields =
          await agrimapApi.getFields();

        if (!fields?.length) {
          setLoading(false);
          return;
        }

        const fieldId = fields[0].id;

        const [soil, vegetation, carbon] =
          await Promise.all([
            agrimapApi.getSoil(fieldId),
            agrimapApi.getVegetation(fieldId),
            agrimapApi.getCarbon(fieldId),
          ]);

        setDashboard({
          fields,
          soil,
          vegetation,
          carbon,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return {
    dashboard,
    loading,
  };
}