import React from 'react';
import PropTypes from 'prop-types';
import { head } from 'lodash';
import { connectRealm } from 'react-native-realm';

import { queryForInvestigator } from '../lib/InvestigatorRequirements';
import CardSearchComponent from './CardSearchComponent';
import { parseDeck } from './parseDeck';
import DeckNavFooter from './DeckNavFooter';

class DeckEditView extends React.Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    investigator: PropTypes.object,
    /* eslint-disable react/no-unused-prop-types */
    deck: PropTypes.object.isRequired,
    slots: PropTypes.object.isRequired,
    updateSlots: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      deckCardCounts: props.slots || {},
    };

    this._backPressed = this.backPressed.bind(this);
    this._onDeckCountChange = this.onDeckCountChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.slots !== this.props.slots) {
      this.setState({
        deckCardCounts: nextProps.slots,
      });
    }
  }

  backPressed() {
    this.props.updateSlots(this.state.deckCardCounts);
  }

  onDeckCountChange(code, count) {
    const newSlots = Object.assign(
      {},
      this.state.deckCardCounts,
      { [code]: count },
    );
    if (count === 0) {
      delete newSlots[code];
    }
    this.setState({
      deckCardCounts: newSlots,
    });
  }

  renderFooter() {
    const {
      navigator,
      deck,
      cards,
    } = this.props;
    const {
      deckCardCounts,
    } = this.state;
    const cardsInDeck = {};
    cards.forEach(card => {
      if (deckCardCounts[card.code] || deck.investigator_code === card.code) {
        cardsInDeck[card.code] = card;
      }
    });
    const pDeck = parseDeck(deck, deckCardCounts, cardsInDeck);
    return (
      <DeckNavFooter
        navigator={navigator}
        parsedDeck={pDeck}
        cards={cardsInDeck}
      />
    );
  }

  render() {
    const {
      navigator,
      investigator,
    } = this.props;

    const {
      deckCardCounts,
    } = this.state;

    return (
      <CardSearchComponent
        navigator={navigator}
        baseQuery={investigator ? queryForInvestigator(investigator) : null}
        deckCardCounts={deckCardCounts}
        onDeckCountChange={this._onDeckCountChange}
        backPressed={this._backPressed}
        backButtonText="Save"
        footer={this.renderFooter()}
      />
    );
  }
}

export default connectRealm(
  DeckEditView,
  {
    schemas: ['Card'],
    mapToProps(results, realm, props) {
      return {
        realm,
        investigator: head(results.cards.filtered(`code == "${props.deck.investigator_code}"`)),
        cards: results.cards,
      };
    },
  },
);
