import React from 'react';
import { Header,Segment,Input,Icon } from 'semantic-ui-react';

export default class MessagesHeader extends React.Component {
  render(){
    const {channelName,numUniqueUsers,handleSearchChange,
      searchLoading,isPrivateChannel,handleStar,isChannelStarred} = this.props;

    return (
      <Segment clearing>
        {/*channel title */}
        <Header className="messages__header" fluid="true" as="h2" floated="left" style={{ marginBottom:0}}>
          <span>
          {channelName}
          {!isPrivateChannel && (
            <Icon
              onClick={handleStar}
              name={isChannelStarred ? 'star' : 'star outline'}
              color={isChannelStarred ? 'yellow' : 'black'}
            />
          )}
          </span>
          <Header.Subheader>{numUniqueUsers}</Header.Subheader>
        </Header>

        {/*channel search*/}
        <Header floated="right">
          <Input
            className="header__search"
            loading={searchLoading}
            onChange={handleSearchChange}
            size="mini"
            icon="search"
            name="searchTerm"
            placeholder="Search Messages"
          />
        </Header>
      </Segment>
    )
  }
}
