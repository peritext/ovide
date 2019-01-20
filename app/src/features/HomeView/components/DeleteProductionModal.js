/**
 * This module provides a modal for confirming the deletion of a production
 * @module ovide/features/HomeView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-form';
import {
  Button,
  Content,
  ModalCard,
  Field,
} from 'quinoa-design-library/components/';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';

/**
 * Imports Components
 */
// import ExplainedLabel from '../../../components/ExplainedLabel';

const DeleteProductionModal = ( {
  // deleteStatus,
  onConfirm,
  onCancel
}, {
  t
} ) => {

  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Components.DeleteProductionModal' );

  /**
   * Callbacks handlers
   */
  const handleSubmitForm = ( ) => {
    onConfirm();
  };

  return (
    <Form onSubmit={ handleSubmitForm }>
      {
        ( formApi ) => {
          const handleSubmit = formApi.submitForm;
          return (
            <form
              onSubmit={ handleSubmit }
              className={ 'ovide-form' }
            >
              <ModalCard
                isActive
                headerContent={ translate( 'Delete a production' ) }
                onClose={ onCancel }
                mainContent={
                  <Field>
                    <Content>
                      {translate( 'Deleting a production cannot be undone. Are you sure ?' )}
                    </Content>
                  </Field>
                }
                footerContent={ [
                  <Button
                    type={ 'submit' }
                    isFullWidth
                    key={ 0 }
                    onClick={ handleSubmit }
                    isColor={ 'danger' }
                  >{translate( 'Delete' )}
                  </Button>,
                  <Button
                    isFullWidth
                    key={ 2 }
                    onClick={ onCancel }
                  >
                    {translate( 'Cancel' )}
                  </Button>
                    ] }
              />
            </form>
                );
}
      }
    </Form>
  );
};

DeleteProductionModal.propTypes = {
  loginStatus: PropTypes.string,
  onCancel: PropTypes.func,
  onDeleteProduction: PropTypes.func,
};

DeleteProductionModal.contextTypes = {
  t: PropTypes.func
};

export default DeleteProductionModal;
