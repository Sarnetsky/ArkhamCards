import React from 'react';
import { t } from 'ttag';

import TextBoxInputComponent from './TextBoxInputComponent';
import PlayScenarioComponent from './PlayScenarioComponent';
import UpgradeDecksInput from './UpgradeDecksInput';
import InvestigatorChoiceWithSuppliesInputComponent from './InvestigatorChoiceWithSuppliesInputComponent';
import InvestigatorChoiceInputComponent from './InvestigatorChoiceInputComponent';
import CampaignGuideContext, { CampaignGuideContextType } from 'components/campaignguide/CampaignGuideContext';
import InvestigatorCheckListComponent from 'components/campaignguide/prompts/InvestigatorCheckListComponent';
import UseSuppliesPrompt from 'components/campaignguide/prompts/UseSuppliesPrompt';
import CampaignGuideTextComponent from 'components/campaignguide/CampaignGuideTextComponent';
import SetupStepWrapper from 'components/campaignguide/SetupStepWrapper';
import CardChoicePrompt from 'components/campaignguide/prompts/CardChoicePrompt';
import InvestigatorCounterComponent from 'components/campaignguide/prompts/InvestigatorCounterComponent';
import ChooseOnePrompt from 'components/campaignguide/prompts/ChooseOnePrompt';
import BinaryPrompt from 'components/campaignguide/prompts/BinaryPrompt';
import NumberPrompt from 'components/campaignguide/prompts/NumberPrompt';
import SuppliesPrompt from 'components/campaignguide/prompts/SuppliesPrompt';
import { InputStep } from 'data/scenario/types';
import GuidedCampaignLog from 'data/scenario/GuidedCampaignLog';
import { chooseOneInputChoices } from 'data/scenario/inputHelper';

interface Props {
  step: InputStep;
  componentId: string;
  campaignLog: GuidedCampaignLog;
  fontScale: number;
}

export default class InputStepComponent extends React.Component<Props> {
  renderContent(campaignId: number): React.ReactNode {
    const {
      step,
      campaignLog,
      componentId,
      fontScale,
    } = this.props;
    switch (step.input.type) {
      case 'choose_one':
        if (step.input.choices.length === 1) {
          return (
            <BinaryPrompt
              id={step.id}
              bulletType={step.bullet_type}
              text={step.input.choices[0].text}
              trueResult={step.input.choices[0]}
            />
          );
        }
        return (
          <ChooseOnePrompt
            id={step.id}
            bulletType={step.bullet_type}
            text={step.text}
            choices={chooseOneInputChoices(step.input.choices, campaignLog)}
            picker={step.input.style === 'picker'}
          />
        );
      case 'counter':
        return (
          <NumberPrompt
            id={step.id}
            bulletType={step.bullet_type}
            prompt={step.input.text}
            longLived={!!step.input.long_lived}
            delta={!!step.input.delta}
            confirmText={step.input.confirm_text}
            effects={step.input.effects}
            min={step.input.min}
            max={step.input.max}
            text={step.text}
          />
        );
      case 'investigator_counter':
        return (
          <>
            <SetupStepWrapper bulletType={step.bullet_type}>
              { !!step.text && <CampaignGuideTextComponent text={step.text} /> }
            </SetupStepWrapper>
            <InvestigatorCounterComponent
              id={step.id}
            />
          </>
        );
      case 'supplies':
        return (
          <SuppliesPrompt
            id={step.id}
            bulletType={step.bullet_type}
            text={step.text}
            input={step.input}
          />
        );
      case 'card_choice':
        return (
          <CardChoicePrompt
            componentId={componentId}
            id={step.id}
            text={step.text}
            input={step.input}
          />
        );
      case 'use_supplies':
        return (
          <UseSuppliesPrompt
            id={step.id}
            text={step.text}
            input={step.input}
            campaignLog={campaignLog}
          />
        );
      case 'investigator_choice':
        return (
          <InvestigatorChoiceInputComponent
            step={step}
            input={step.input}
            campaignLog={campaignLog}
          />
        );
      case 'investigator_choice_supplies':
        return (
          <InvestigatorChoiceWithSuppliesInputComponent
            step={step}
            input={step.input}
            campaignLog={campaignLog}
          />
        );
      case 'upgrade_decks':
        return (
          <UpgradeDecksInput
            id={step.id}
            componentId={componentId}
            fontScale={fontScale}
          />
        );
      case 'play_scenario':
        return (
          <PlayScenarioComponent
            id={step.id}
            campaignId={campaignId}
            componentId={componentId}
            input={step.input}
          />
        );
      case 'scenario_investigators':
        return (
          <>
            { !!step.text && (
              <SetupStepWrapper>
                <CampaignGuideTextComponent text={step.text} />
              </SetupStepWrapper>
            ) }
            <InvestigatorCheckListComponent
              id={step.id}
              choiceId="chosen"
              checkText={t`Choose Investigators`}
              defaultState
              min={1}
              max={4}
              allowNewDecks
            />
          </>
        );
      case 'text_box':
        return (
          <TextBoxInputComponent
            id={step.id}
            prompt={step.text}
          />
        );
    }
  }

  render() {
    return (
      <CampaignGuideContext.Consumer>
        { ({ campaignId }: CampaignGuideContextType) => (
          this.renderContent(campaignId)
        ) }
      </CampaignGuideContext.Consumer>
    );
  }
}