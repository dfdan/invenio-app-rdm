// This file is part of InvenioRDM
// Copyright (C) 2020-2022 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021-2022 Graz University of Technology.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_app_rdm/i18next";
import _get from "lodash/get";
import React, { Component, createRef, Fragment } from "react";
import {
  AccessRightField,
  CommunityHeader,
  CreatibutorsField,
  DatesField,
  DeleteButton,
  DepositFormApp,
  DepositFormTitle,
  DescriptionsField,
  FileUploader,
  FormFeedback,
  IdentifiersField,
  LanguagesField,
  LicenseField,
  PIDField,
  PreviewButton,
  PublicationDateField,
  PublishButton,
  PublisherField,
  RelatedWorksField,
  ResourceTypeField,
  SaveButton,
  SubjectsField,
  TitlesField,
  VersionField,
} from "react-invenio-deposit";
import { AccordionField } from "react-invenio-forms";
import { Card, Container, Divider, Grid, Ref, Sticky } from "semantic-ui-react";

export class RDMDepositForm extends Component {
  constructor(props) {
    super(props);
    this.config = props.config || {};
    // TODO: retrieve from backend
    this.config["canHaveMetadataOnlyRecords"] = true;

    // TODO: Make ALL vocabulary be generated by backend.
    // Currently, some vocabulary is generated by backend and some is
    // generated by frontend here. Iteration is faster and abstractions can be
    // discovered by generating vocabulary here. Once happy with vocabularies,
    // then we can generate it in the backend.
    this.vocabularies = {
      metadata: {
        ...this.config.vocabularies,

        creators: {
          ...this.config.vocabularies.creators,
          type: [
            { text: "Person", value: "personal" },
            { text: "Organization", value: "organizational" },
          ],
        },

        contributors: {
          ...this.config.vocabularies.creators,
          type: [
            { text: "Person", value: "personal" },
            { text: "Organization", value: "organizational" },
          ],
        },

        // TODO: Replace with an API backend
        funding: {
          funder: [
            {
              name: "National Institutes of Health (US)",
              identifier: "funder1",
              scheme: "funderScheme1",
            },
            {
              name: "European Commission (EU)",
              identifier: "funder2",
              scheme: "funderScheme2",
            },
          ],
          award: [
            {
              title: "CANCER &AIDS DRUGS--PRECLIN PHARMACOL/TOXICOLOGY",
              number: "N01CM037835-016",
              identifier: "awardA",
              scheme: "awardSchemeA",
              parentScheme: "funderScheme1",
              parentIdentifier: "funder1",
            },
            {
              title:
                "Beyond the Standard Model at the LHC and with Atom Interferometers.",
              number: "228169",
              identifier: "awardB1",
              scheme: "awardSchemeB",
              parentScheme: "funderScheme2",
              parentIdentifier: "funder2",
            },
            {
              title: "ENvironmental COnditions in GLAucoma Patients",
              number: "747441",
              identifier: "awardB2",
              scheme: "awardSchemeB",
              parentScheme: "funderScheme2",
              parentIdentifier: "funder2",
            },
          ],
        },
        identifiers: {
          ...this.config.vocabularies.identifiers,
        },
      },
    };

    // check if files are present
    this.noFiles = false;
    if (
      !Array.isArray(this.props.files.entries) ||
      (!this.props.files.entries.length && this.props.record.is_published)
    ) {
      this.noFiles = true;
    }
  }

  formFeedbackRef = createRef();
  sidebarRef = createRef();

  accordionStyle = {
    header: { className: "inverted brand", style: { cursor: "pointer" } },
  };

  render() {
    const {
      record,
      files,
      permissions,
      preselectedCommunity,
      communitiesEnabled,
    } = this.props;
    return (
      <DepositFormApp
        config={this.config}
        record={record}
        preselectedCommunity={preselectedCommunity}
        files={files}
        permissions={permissions}
      >
        <FormFeedback fieldPath="message" />
        {communitiesEnabled && (
          <CommunityHeader imagePlaceholderLink="/static/images/square-placeholder.png" />
        )}
        <Container style={{ marginTop: "10px" }}>
          <DepositFormTitle />
          <Grid>
            <Grid.Row>
              <Grid.Column width={11}>
                <AccordionField
                  fieldPath=""
                  active={true}
                  label={i18next.t("Files")}
                  ui={this.accordionStyle}
                >
                  {this.noFiles && record.is_published && (
                    <p
                      style={{
                        textAlign: "center",
                        opacity: "0.5",
                        cursor: "default !important",
                      }}
                    >
                      <em>{i18next.t("The record has no files.")}</em>
                    </p>
                  )}
                  <FileUploader
                    isDraftRecord={!record.is_published}
                    quota={{
                      maxFiles: 100,
                      maxStorage: 10 ** 10,
                    }}
                  />
                </AccordionField>

                <AccordionField
                  fieldPath=""
                  active={true}
                  label={i18next.t("Basic information")}
                  ui={this.accordionStyle}
                >
                  {this.config.pids.map((pid) => (
                    <Fragment key={pid.scheme}>
                      <PIDField
                        btnLabelDiscardPID={pid.btn_label_discard_pid}
                        btnLabelGetPID={pid.btn_label_get_pid}
                        canBeManaged={pid.can_be_managed}
                        canBeUnmanaged={pid.can_be_unmanaged}
                        fieldPath={`pids.${pid.scheme}`}
                        fieldLabel={pid.field_label}
                        isEditingPublishedRecord={
                          record.is_published === true // is_published is `null` at first upload
                        }
                        managedHelpText={pid.managed_help_text}
                        pidLabel={pid.pid_label}
                        pidPlaceholder={pid.pid_placeholder}
                        pidType={pid.scheme}
                        unmanagedHelpText={pid.unmanaged_help_text}
                        required
                      />
                      <Divider />
                    </Fragment>
                  ))}

                  <ResourceTypeField
                    options={this.vocabularies.metadata.resource_type}
                    required
                  />
                  <TitlesField
                    options={this.vocabularies.metadata.titles}
                    recordUI={record.ui}
                    required
                  />
                  <PublicationDateField required />
                  <CreatibutorsField
                    label={i18next.t("Creators")}
                    labelIcon={"user"}
                    fieldPath={"metadata.creators"}
                    roleOptions={this.vocabularies.metadata.creators.role}
                    schema="creators"
                    autocompleteNames={this.config.autocomplete_names}
                    required
                  />
                  <DescriptionsField
                    options={this.vocabularies.metadata.descriptions}
                    recordUI={_get(record, "ui", null)}
                    editorConfig={{
                      removePlugins: [
                        "Image",
                        "ImageCaption",
                        "ImageStyle",
                        "ImageToolbar",
                        "ImageUpload",
                        "MediaEmbed",
                        "Table",
                        "TableToolbar",
                        "TableProperties",
                        "TableCellProperties",
                      ],
                    }}
                  />
                  <LicenseField
                    fieldPath="metadata.rights"
                    searchConfig={{
                      searchApi: {
                        axios: {
                          headers: {
                            Accept: "application/vnd.inveniordm.v1+json",
                          },
                          url: "/api/vocabularies/licenses",
                          withCredentials: false,
                        },
                      },
                      initialQueryState: {
                        filters: [["tags", "recommended"]],
                      },
                    }}
                    serializeLicenses={(result) => ({
                      title: result.title_l10n,
                      description: result.description_l10n,
                      id: result.id,
                      link: result.props.url,
                    })}
                  />
                  <br />
                </AccordionField>

                <AccordionField
                  fieldPath=""
                  active={true}
                  label={i18next.t("Recommended information")}
                  ui={this.accordionStyle}
                >
                  <CreatibutorsField
                    addButtonLabel={i18next.t("Add contributor")}
                    label={i18next.t("Contributors")}
                    labelIcon={"user plus"}
                    fieldPath={"metadata.contributors"}
                    roleOptions={this.vocabularies.metadata.contributors.role}
                    schema="contributors"
                    autocompleteNames={this.config.autocomplete_names}
                    modal={{
                      addLabel: "Add contributor",
                      editLabel: "Edit contributor",
                    }}
                  />
                  <SubjectsField
                    initialOptions={_get(record, "ui.subjects", null)}
                    limitToOptions={
                      this.vocabularies.metadata.subjects.limit_to
                    }
                  />

                  <LanguagesField
                    initialOptions={_get(record, "ui.languages", []).filter(
                      (lang) => lang !== null
                    )} // needed because dumped empty record from backend gives [null]
                    serializeSuggestions={(suggestions) =>
                      suggestions.map((item) => ({
                        text: item.title_l10n,
                        value: item.id,
                        key: item.id,
                      }))
                    }
                  />
                  <DatesField options={this.vocabularies.metadata.dates} />
                  <VersionField />
                  <PublisherField />
                  <br />
                </AccordionField>
                {/**TODO: uncomment to use FundingField*/}
                {/* <AccordionField
                fieldPath=""
                active={true}
                label={"Funding"}
                ui={this.accordionStyle}
                >
                <FundingField options={this.vocabularies.metadata.funding} />
                <ComingSoonField
                  fieldPath="metadata.funding"
                  label="Awards"
                  labelIcon="money bill alternate outline"
                />

                <br />
                </AccordionField> */}

                <AccordionField
                  fieldPath=""
                  active={true}
                  label={i18next.t("Alternate identifiers")}
                  ui={this.accordionStyle}
                >
                  <IdentifiersField
                    fieldPath="metadata.identifiers"
                    label={i18next.t("Alternate identifier(s)")}
                    labelIcon="barcode"
                    schemeOptions={
                      this.vocabularies.metadata.identifiers.scheme
                    }
                  />
                </AccordionField>

                <AccordionField
                  fieldPath=""
                  active={true}
                  label={i18next.t("Related works")}
                  ui={this.accordionStyle}
                >
                  <RelatedWorksField
                    options={this.vocabularies.metadata.identifiers}
                  />
                  <br />
                </AccordionField>
              </Grid.Column>
              <Ref innerRef={this.sidebarRef}>
                <Grid.Column width={5} className="deposit-sidebar">
                  <Sticky context={this.sidebarRef} offset={20}>
                    <Card className="actions">
                      <Card.Content>
                        <div className="sidebar-buttons">
                          <SaveButton fluid className="save-button" />
                          <PreviewButton fluid className="preview-button" />
                        </div>
                        <PublishButton fluid />
                      </Card.Content>
                    </Card>

                    <Card className="actions">
                      <Card.Content>
                        <DeleteButton
                          fluid
                          // TODO: make is_published part of the API response
                          //       so we don't have to do this
                          isPublished={record.is_published}
                        />
                      </Card.Content>
                    </Card>

                    <AccessRightField
                      label={i18next.t("Visibility")}
                      labelIcon={"shield"}
                    />
                  </Sticky>
                </Grid.Column>
              </Ref>
            </Grid.Row>
          </Grid>
        </Container>
      </DepositFormApp>
    );
  }
}
