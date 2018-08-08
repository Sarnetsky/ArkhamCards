import React from 'react';
import PropTypes from 'prop-types';
import { filter, map } from 'lodash';
import {
  FlatList,
  Keyboard,
  StyleSheet,
  View,
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { searchMatchesText } from './searchHelpers';
import SearchBox from './SearchBox';
import DeckListRow from './DeckListRow';
import withPlayerCards from './withPlayerCards';
import { getAllDecks } from '../reducers';
import * as Actions from '../actions';

class DeckListComponent extends React.Component {
  static propTypes = {
    deckIds: PropTypes.array.isRequired,
    deckClicked: PropTypes.func.isRequired,
    onRefresh: PropTypes.func.isRequired,
    refreshing: PropTypes.bool,
    investigators: PropTypes.object,
    cards: PropTypes.object,
    decks: PropTypes.object,
    fetchPublicDeck: PropTypes.func.isRequired,
    customHeader: PropTypes.node,
  }

  constructor(props) {
    super(props);

    this.state = {
      searchTerm: '',
    };

    this._deckClicked = this.deckClicked.bind(this);
    this._searchChanged = this.searchChanged.bind(this);
    this._renderHeader = this.renderHeader.bind(this);
    this._renderFooter = this.renderFooter.bind(this);
    this._renderItem = this.renderItem.bind(this);
  }

  deckClicked(deck, investigator) {
    Keyboard.dismiss();
    this.props.deckClicked(deck, investigator);
  }

  searchChanged(searchTerm) {
    this.setState({
      searchTerm,
    });
  }

  componentDidMount() {
    const {
      deckIds,
      decks,
      fetchPublicDeck,
    } = this.props;
    deckIds.forEach(deckId => {
      if (!decks[deckId]) {
        fetchPublicDeck(deckId, false);
      }
    });
  }

  renderItem({ item: { deckId } }) {
    const {
      investigators,
      decks,
      cards,
    } = this.props;

    const deck = decks[deckId];
    return (
      <DeckListRow
        key={deckId}
        id={deckId}
        deck={deck}
        cards={cards}
        investigator={deck ? investigators[deck.investigator_code] : null}
        onPress={this._deckClicked}
      />
    );
  }

  renderHeader() {
    const {
      customHeader,
    } = this.props;
    return (
      <View style={styles.header}>
        <SearchBox
          onChangeText={this._searchChanged}
          placeholder="Search decks"
        />
        { !!customHeader && customHeader }
      </View>
    );
  }

  renderFooter() {
    return (
      <View style={styles.footer} />
    );
  }

  render() {
    const {
      deckIds,
      onRefresh,
      refreshing,
      decks,
      investigators,
    } = this.props;

    const {
      searchTerm,
    } = this.state;
    const data = map(
      filter(deckIds, deckId => {
        const deck = decks[deckId];
        const investigator = deck && investigators[deck.investigator_code];
        if (!deck || !investigator) {
          return true;
        }
        return searchMatchesText(searchTerm, [deck.name, investigator.name]);
      }), deckId => {
        return {
          key: `${deckId}`,
          deckId,
        };
      });

    return (
      <FlatList
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        refreshing={refreshing}
        onRefresh={onRefresh}
        style={styles.container}
        data={data}
        renderItem={this._renderItem}
        extraData={this.props.decks}
        ListHeaderComponent={this._renderHeader}
        ListFooterComponent={this._renderFooter}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    decks: getAllDecks(state),
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(withPlayerCards(DeckListComponent));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  footer: {
    height: 100,
  },
});
