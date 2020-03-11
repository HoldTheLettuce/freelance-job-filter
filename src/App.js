import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import './App.css';

import { Container, Grid, Card, Button } from 'semantic-ui-react';

import { formatDistanceStrict } from 'date-fns';

const axios = require('axios');

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentTime: new Date(),
      lastJobFetchAt: 0,
      lastJobId: null,
      jobs: []
    };
  }

  updateJobs() {
    console.log('Fetching jobs...');
    
    axios.get('https://www.freelancer.com/ajax-api/navigation/project-feed/pre-populated.php?compact=true&new_errors=true', {
      headers: {
          'Content-Type': 'application/json',
          'freelancer-auth-v2': process.env.REACT_APP_FREELANCER_AUTH
      }
    }).then(res => {
      let data = res.data;
      let jobs = [];

      this.setState({
        lastJobFetchAt: Date.now()
      });

      data.result.forEach(job => {
          if(job.currencyCode === 'USD' && job.nonpublic === false && (this.state.lastJobId === null || job.id > this.state.lastJobId)) {
              jobs.push(job);
              console.log(`Found USD job with ID ${job.id}`);
          }
      });

      this.setState({
        jobs
      });
    }).catch(err => {
        console.log(`Failed to fetch!`);
    });
  }

  componentDidMount() {
    this.updateJobs();

    this.updateCurrentTimeInterval = setInterval(() => {
      this.setState({
        currentTime: new Date()
      });
    }, 3000);

    this.fetchJobInterval = setInterval(() => this.updateJobs(), 30000);
  }

  componentWillUnmount() {
    clearInterval(this.fetchJobInterval);
    clearInterval(this.updateCurrentTimeInterval);
  }
  
  render() {
    return (
      <Container>
        <p>Last fetch <strong>{ formatDistanceStrict(this.state.lastJobFetchAt, this.state.currentTime) } ago...</strong></p>
        
        <Grid columns={1}>
          {
            this.state.jobs.map(job => (
              <Grid.Row>
                <Grid.Column>
                  <Card centered fluid>
                    <Card.Content>
                      <Card.Header>{ job.title }</Card.Header>
                      <Card.Meta>{ job.projIsHourly ? 'Hourly: ' : 'Fixed Price: ' } ${ job.minbudget } - ${ job.maxbudget }</Card.Meta>

                      <Card.Description>
                        { job.appended_descr }
                      </Card.Description>
                    </Card.Content>

                    <Card.Content extra>
                      <Button as='a' target='_blank' href={ 'https://freelancer.com' + job.linkUrl }>View Job</Button>
                    </Card.Content>
                  </Card>
                </Grid.Column>
              </Grid.Row>
            ))
          }
        </Grid>
      </Container>
    );
  }
}

export default App;
