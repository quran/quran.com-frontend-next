import React from 'react';
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import { DateTime } from 'luxon';
import { Form, Field } from 'react-final-form';
import { Row, Col } from 'styled-bootstrap-grid';
import { IoMdTime, IoMdList, IoIosLink } from 'react-icons/io';
import { CREATE_POST, POSTS_QUERY } from '../graphql/posts';

const TitleInput = styled.input`
  font-family: Schear Grotesk;
  font-style: normal;
  font-weight: bold;
  font-size: 56px;
  line-height: 48px;
  text-transform: uppercase;
  color: #222222;
  border: none;
  background: none;
  width: 100%;
`;

const Divider = styled.hr`
  background: #000000;
  opacity: 0.1;
  margin-top: 1rem;
  margin-bottom: 1rem;
`;

const Input = styled.input<{ withIcon: boolean }>`
  font-family: Maison Neue;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #222222;
  opacity: 0.5;
  border: none;
  background: none;
  width: 100%;
  padding-top: 1rem;
  padding-bottom: 1rem;
  padding-left: ${(props) => (props.withIcon ? '1rem' : 0)};
`;

const SubmitButton = styled.button`
  background: #222222;
  text-transform: uppercase;
  width: 100%;
  color: #fff;
  padding-top: 1rem;
  padding-bottom: 1rem;
  margin-top: 2rem;
`;

const TimeFields = styled.div`
  display: flex;
`;

const InputContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
`;

const ErrorText = styled.p`
  color: ${(props) => props.theme.redColor};
  font-family: Maison Neue;
`;

const required = (value: string) => (value ? undefined : 'Required');

const NewPostform = ({ onCloseModal }: { onCloseModal: () => void }) => {
  const todayDate = new Date();
  const [submitData] = useMutation(CREATE_POST, { refetchQueries: [{ query: POSTS_QUERY }] });

  const submit = (data) =>
    submitData({
      variables: {
        data: {
          post: {
            ...data,
            time_start: DateTime.fromSQL(`${data.date} ${data.time_start}`).toISO(),
            time_end: DateTime.fromSQL(`${data.date} ${data.time_end}`).toISO(),
          },
        },
      },
    }).then(onCloseModal);

  return (
    <Form
      onSubmit={submit}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <Field
            name="title"
            validate={required}
            render={({ input, meta }) => (
              <>
                <TitleInput {...input} placeholder="Title" required />
                {meta.touched && meta.error && <ErrorText>{meta.error}</ErrorText>}
              </>
            )}
          />
          <Divider />
          <Row>
            <Col xs="6" md="6">
              <Field
                name="date"
                render={({ input }) => (
                  <InputContainer>
                    <IoMdTime />
                    <Input type="date" {...input} placeholder="Date" withIcon required />
                  </InputContainer>
                )}
                type="date"
                initialValue={todayDate.toLocaleDateString()}
              />
              <Divider />
            </Col>
            <Col xs="6" md="6">
              <TimeFields>
                <Field
                  name="time_start"
                  render={({ input }) => <Input type="time" {...input} required />}
                  initialValue="12:00"
                />
                <Field
                  name="time_end"
                  render={({ input }) => <Input type="time" {...input} required />}
                  initialValue="13:00"
                  validate={(value, values) =>
                    // @ts-ignore
                    value > values.time_start ? undefined : 'End time cannot be after start'
                  }
                />
              </TimeFields>
              <Field
                name="time_end"
                render={({ meta }) =>
                  meta.touched && meta.error && <ErrorText>{meta.error}</ErrorText>
                }
              />
              <Divider />
            </Col>
          </Row>
          <Field
            name="url"
            validate={(value: string) => {
              if (value) {
                if (!value.includes('zoom.us')) {
                  return 'Must include zoom link';
                }

                return undefined;
              }

              return 'Required';
            }}
            render={({ input, meta }) => (
              <>
                <InputContainer>
                  <IoIosLink />
                  <Input type="url" {...input} placeholder="Paste a Zoom URL" withIcon required />
                </InputContainer>
                {meta.touched && meta.error && <ErrorText>{meta.error}</ErrorText>}
              </>
            )}
          />
          <Divider />
          <Field
            name="description"
            validate={required}
            render={({ input, meta }) => (
              <>
                <InputContainer>
                  <IoMdList />
                  <Input
                    as="textarea"
                    {...input}
                    placeholder="Add a description"
                    row={6}
                    withIcon
                    required
                  />
                </InputContainer>
                {meta.touched && meta.error && <ErrorText>{meta.error}</ErrorText>}
              </>
            )}
          />
          <SubmitButton type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit event'}
          </SubmitButton>
        </form>
      )}
    />
  );
};

export default NewPostform;
