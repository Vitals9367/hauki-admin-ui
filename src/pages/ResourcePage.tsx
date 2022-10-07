import React, { ReactNode, useEffect, useState } from 'react';
import { Accordion, Notification } from 'hds-react';
import { useAppContext } from '../App-context';
import api from '../common/utils/api/api';
import { Language, Resource } from '../common/lib/types';
import sessionStorage from '../common/utils/storage/sessionStorage';
import Collapse from '../components/collapse/Collapse';
import { displayLangVersionNotFound } from '../components/language-select/LanguageSelect';
import { Link } from '../components/link/Link';
import ResourceOpeningHours from '../components/resource-opening-hours/ResourceOpeningHours';
import ResourcePeriodsCopyFieldset, {
  TargetResourcesProps,
} from '../components/resource-opening-hours/ResourcePeriodsCopyFieldset';
import './ResourcePage.scss';
import ResourceTitle from '../components/resource-title/ResourceTitle';

const ResourceSection = ({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}): JSX.Element => (
  <section id={id} className="resource-details-section">
    {children}
  </section>
);

const ResourceDetailsSection = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}): JSX.Element => (
  <ResourceSection id={id}>
    <Collapse isOpen collapseContentId={`${id}-section`} title={title}>
      {children}
    </Collapse>
  </ResourceSection>
);

export default function ResourcePage({
  childId,
  id,
  targetResourcesString,
}: {
  childId?: string;
  id: string;
  targetResourcesString?: string;
}): JSX.Element {
  const { language: contextLanguage } = useAppContext();
  const language = contextLanguage || Language.FI;
  const [resource, setResource] = useState<Resource | undefined>(undefined);
  const [childResources, setChildResources] = useState<Resource[]>([]);
  const [parentResources, setParentResources] = useState<Resource[]>([]);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [targetResourceData, setTargetResourceData] = useState<
    TargetResourcesProps | undefined
  >(undefined);
  const targetResourcesStorageKey = 'targetResources';

  const hasTargetResources =
    targetResourceData?.mainResourceId === resource?.id &&
    targetResourceData?.targetResources &&
    targetResourceData?.targetResources.length > 0;

  useEffect(() => {
    if (resource) {
      if (targetResourcesString) {
        const mainResourceId = resource.id;
        const mainResourceName = resource?.name[language];
        const targetResources = targetResourcesString.split(',');
        const newData = { mainResourceId, mainResourceName, targetResources };
        setTargetResourceData(newData);
        sessionStorage.storeItem<TargetResourcesProps>({
          key: targetResourcesStorageKey,
          value: newData,
        });
      } else {
        const oldData = sessionStorage.getItem<TargetResourcesProps>(
          targetResourcesStorageKey
        );
        if (oldData) {
          if (oldData.mainResourceId === resource?.id) {
            setTargetResourceData(oldData);
          } else {
            sessionStorage.removeItem(targetResourcesStorageKey);
          }
        }
      }
    }
  }, [language, resource, targetResourcesString]);

  useEffect((): void => {
    // UseEffect's callbacks are synchronous to prevent a race condition.
    // We can not use an async function as an useEffect's callback because it would return Promise<void>
    api
      .getResource(id)
      .then(async (r: Resource) => {
        setResource(r);
        const resourceHasChildren = r.children.length > 0;
        const resourceHasParents = r.parents.length > 0;

        if (resourceHasChildren || resourceHasParents) {
          // fetch children and parents
          const [childR, parentR] = await Promise.all([
            resourceHasChildren ? api.getChildResourcesByParentId(r.id) : [],
            resourceHasParents ? api.getParentResourcesByChildId(r.id) : [],
          ]);

          setChildResources(childR);
          setParentResources(parentR);
        }
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e);
        setLoading(false);
      });
  }, [id]);

  if (error) {
    return (
      <>
        <h1 className="resource-info-title">Virhe</h1>
        <Notification label="Toimipistettä ei saatu ladattua." type="error">
          Tarkista toimipiste-id.
        </Notification>
      </>
    );
  }

  if (isLoading || !resource) {
    return (
      <>
        <h1 className="resource-info-title">Toimipisteen tietojen haku</h1>
      </>
    );
  }

  return (
    <div className="resource-page">
      <ResourceTitle resource={resource} language={language} />
      {childResources.length > 0 && (
        <p className="resource-child-resources-description">
          Tällä toimipisteellä on {childResources.length} alakohdetta. Niiden
          aukioloajat löytyvät alempana tällä sivulla.
        </p>
      )}
      {hasTargetResources && (
        <ResourcePeriodsCopyFieldset
          {...targetResourceData}
          onChange={(resourceData): void => setTargetResourceData(resourceData)}
        />
      )}
      {!hasTargetResources && parentResources?.length > 0 && (
        <ResourceDetailsSection
          id="parent-resource-description"
          title="Toimipisteet">
          <p
            data-test="parent-resource-description"
            className="resource-description-text">
            Tämä alakohde sijaitsee seuraavissa toimipisteissä.
          </p>
          {parentResources?.map((parentResource, index) => (
            <div className="related-resource-list-item" key={index}>
              <Link
                dataTest={`parent-resource-name-${index}`}
                href={`/resource/${parentResource.id}`}
                text={
                  parentResource?.name[language] ||
                  displayLangVersionNotFound({
                    language,
                    label: 'toimipisteen nimi',
                  })
                }
              />
            </div>
          ))}
        </ResourceDetailsSection>
      )}
      <ResourceSection id="resource-opening-hours">
        {resource && (
          <ResourceOpeningHours
            language={language}
            resource={resource}
            holidaysTableInitiallyOpen={childResources.length === 0}
          />
        )}
      </ResourceSection>
      {!hasTargetResources && childResources?.length > 0 && (
        <>
          <section>
            <h2 className="child-resources-title">Toimipisteen alakohteet</h2>
            <p
              data-test="child-resource-description"
              className="resource-description-text">
              Täällä voit määritellä toimipisteen alakohteiden aukioloaikoja.
              Alakohteet luodaan toimipisterekisterissä.
            </p>
          </section>
          <section>
            {childResources?.map((childResource, index) => (
              <Accordion
                key={index}
                initiallyOpen={childId === `${childResource.id}`}
                heading={
                  childResource?.name[language] ||
                  displayLangVersionNotFound({
                    language,
                    label: 'alakohteen nimi',
                  })
                }>
                <ResourceOpeningHours
                  language={language}
                  parentId={resource.id}
                  resource={childResource}
                />
              </Accordion>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
