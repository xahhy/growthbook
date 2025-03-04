import { FC, useEffect, useState } from "react";
import NewExperimentForm from "./NewExperimentForm";
import ImportExperimentList from "./ImportExperimentList";
import { ExperimentInterfaceStringDates } from "back-end/types/experiment";
import Modal from "../Modal";
import { useDefinitions } from "../../services/DefinitionsContext";
import { useAuth } from "../../services/auth";

const ImportExperimentModal: FC<{
  onClose: () => void;
  initialValue?: Partial<ExperimentInterfaceStringDates>;
  importMode?: boolean;
  source?: string;
}> = ({ onClose, initialValue, importMode = true, source }) => {
  const { datasources } = useDefinitions();
  const [
    selected,
    setSelected,
  ] = useState<null | Partial<ExperimentInterfaceStringDates>>(initialValue);
  const [importModal, setImportModal] = useState<boolean>(importMode);
  const [datasourceId, setDatasourceId] = useState(() => {
    if (!datasources) return null;
    return (
      datasources.filter((d) => d.properties.pastExperiments)[0]?.id ?? null
    );
  });
  const [importId, setImportId] = useState(null);

  const { apiCall } = useAuth();

  const getImportId = async () => {
    if (datasourceId) {
      try {
        const res = await apiCall<{ id: string }>("/experiments/import", {
          method: "POST",
          body: JSON.stringify({
            datasource: datasourceId,
          }),
        });
        if (res?.id) {
          setImportId(res.id);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };
  useEffect(() => {
    getImportId();
  }, [datasourceId]);

  if (selected || !importModal || !datasourceId) {
    return (
      <NewExperimentForm
        initialValue={selected}
        onClose={() => onClose()}
        source={source}
        isImport={!!selected}
      />
    );
  }

  return (
    <Modal
      header="Add Experiment"
      open={true}
      size="lg"
      close={() => onClose()}
    >
      <div className="alert alert-info">
        Prefer to start with a blank experiment instead?{" "}
        <a
          href="#"
          className="alert-link"
          onClick={(e) => {
            e.preventDefault();
            setImportModal(false);
          }}
        >
          Create New Draft
        </a>
      </div>
      <h2>Import from Data source</h2>
      {importId && (
        <ImportExperimentList
          onImport={(create) => {
            setSelected(create);
          }}
          changeDatasource={setDatasourceId}
          importId={importId}
          hideImported={true}
        />
      )}
    </Modal>
  );
};
export default ImportExperimentModal;
