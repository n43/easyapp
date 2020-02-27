import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { createPath } from 'history';

export default function Page(props) {
  const {
    exact,
    path,
    location,
    component,
    validator,
    children: validatorOptions,
  } = props;

  return React.createElement(Route, {
    exact,
    path,
    location,
    render: routeProps => {
      const key = routeProps.location.key || createPath(routeProps.location);
      let element = React.createElement(component, { ...routeProps, key });

      if (validator) {
        const validatorProps = { ...routeProps, key };

        if (React.isValidElement(validatorOptions)) {
          Object.assign(validatorProps, validatorOptions.props);
        }

        element = React.createElement(validator, validatorProps, element);
      }

      return element;
    },
  });
}

Page.Validator = () => null;
Page.Group = ({ children, error404, ...switchProps }) =>
  React.createElement(
    Switch,
    switchProps,
    ...children,
    error404 ? React.createElement(Route, { component: error404 }) : null
  );
Page.Redirect = props => React.createElement(Redirect, props);
