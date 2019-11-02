/**
 * This module provides a form for creating a new production
 * @module ovide/features/HomeView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import {
  Column,
  Columns,
  Container,
  Delete,
  DropZone,
  Help,
  Tab,
  TabLink,
  TabList,
  Tabs,
  Title,
} from 'quinoa-design-library/components';

/**
 * Imports Components
 */
import MetadataForm from '../../../components/MetadataForm';

const NewProductionForm = ( {
  createProductionStatus,
  importProductionStatus,
  mode,
  newProduction,
  onClose,
  onCloseNewProduction,
  onCreateNewProduction,
  onDropFiles,
  onSetModeFile,
  onSetModeForm,
  translate,
  widthRatio,
} ) => {
  return (
    <Column isSize={ widthRatio }>
      <Column>
        <Title isSize={ 2 }>
          <Columns>
            <Column isSize={ 11 }>
              {translate( 'New Production' )}
            </Column>
            <Column>
              <Delete onClick={ onClose } />
            </Column>
          </Columns>
        </Title>
        <Tabs
          isBoxed
          isFullWidth
        >
          <Container>
            <TabList>
              <Tab
                onClick={ onSetModeForm }
                isActive={ mode === 'form' }
              ><TabLink>{translate( 'Create a production' )}</TabLink>
              </Tab>
              <Tab
                onClick={ onSetModeFile }
                isActive={ mode === 'file' }
              ><TabLink>{translate( 'Import an existing production' )}</TabLink>
              </Tab>
            </TabList>
          </Container>
        </Tabs>
        {mode === 'form' ?
          <MetadataForm
            production={ newProduction }
            status={ createProductionStatus }
            onSubmit={ onCreateNewProduction }
            onCancel={ onCloseNewProduction }
          />
                :
          <Column>
            <DropZone
              accept={ 'application/json,application/zip' }
              onDrop={ onDropFiles }
            >
              {translate( 'Drop a ovide file' )}
            </DropZone>
            {importProductionStatus === 'fail' && <Help isColor={ 'danger' }>{translate( 'Production is not valid' )}</Help>}

          </Column>
            }
      </Column>

    </Column>
  );
};

export default NewProductionForm;
