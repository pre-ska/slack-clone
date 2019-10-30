import React, { Component, Fragment } from "react";
import { Segment, Comment } from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessagesForm from "./MessagesForm";
import Message from "./Message";
import firebase from "../../firebase";

export class Messages extends Component {
  state = {
    messagesRef: firebase.database().ref("messages"),
    messages: [],
    messagesLoading: true,
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    progressbar: false,
    numUniqueUsers: "",
    searchTerm: "",
    searchLoading: false,
    searchResults: []
  };

  componentDidMount() {
    const { channel, user } = this.state;
    if (channel && user) this.addListeners(channel.id);
  }

  addListeners = channelId => {
    this.addMessageListener(channelId);
  };

  addMessageListener = channelId => {
    let loadedMessages = [];
    let TO;

    this.state.messagesRef.child(channelId).on("child_added", snap => {
      loadedMessages.push(snap.val());

      clearTimeout(TO);
      // child_added dodaje listenere pojedinačno na svaku poruku
      //pa mi se onda re-renderira komponentta svaki put
      // zato setTimeout
      TO = setTimeout(() => {
        this.setState({
          messages: loadedMessages,
          messagesLoading: false
        });

        this.countUniqueUsers(loadedMessages);
      }, 100);
    });
  };

  handleSearchChange = e => {
    //na svaki search input, spremam searchTerm u state i
    //češljam messages array u callbacku
    this.setState(
      {
        searchTerm: e.target.value,
        searchLoading: true
      },
      () => this.handleSearchMessages()
    );
  };

  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, "gi");
    let TO;
    // vrati mi samo poruke koje sadržavaju searchTerm
    const searchResults = channelMessages.reduce((acc, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({ searchResults });

    //animacija u inputu...
    clearTimeout(TO);
    TO = setTimeout(() => {
      this.setState({ searchLoading: false });
    }, 500);
  };

  countUniqueUsers = messages => {
    //izbroji koliko ima sudionika u chatu...preko imena u porukama
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }

      return acc;
    }, []);
    const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
    const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;

    this.setState({ numUniqueUsers });
  };

  displayMessages = messages =>
    messages.length &&
    messages.map(message => (
      <Message
        key={message.timestamp}
        message={message}
        user={this.state.user}
      />
    ));

  isProgressBarVisible = percent => {
    if (percent > 0) {
      this.setState({ progressBar: true });
    }
  };

  displayChannelName = channel => (channel ? `#${channel.name}` : "");

  render() {
    const {
      messagesRef,
      channel,
      user,
      messages,
      progressBar,
      numUniqueUsers,
      searchResults,
      searchTerm,
      searchLoading
    } = this.state;

    return (
      <Fragment>
        <MessagesHeader
          numUniqueUsers={numUniqueUsers}
          channelName={this.displayChannelName(channel)}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
        />
        <Segment>
          <Comment.Group
            className={progressBar ? "messages__progress" : "messages"}>
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
          </Comment.Group>
        </Segment>
        <MessagesForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isProgressBarVisible={this.isProgressBarVisible}
        />
      </Fragment>
    );
  }
}

export default Messages;
