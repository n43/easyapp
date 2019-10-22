import React, { Fragment, useLayoutEffect, useRef, useMemo } from 'react';
import { createAppContainer } from 'react-navigation';

let sharedRouterRef = null;

function Router({ component: App, children, ...props }) {
  const routerRef = useRef();
  const AppContainer = useMemo(() => {
    function RouterNavigator(props) {
      return (
        <Fragment>
          {children ? children(props) : null}
          <App {...props} />
        </Fragment>
      );
    }
    RouterNavigator.router = App.router;

    return createAppContainer(RouterNavigator);
  }, [App, children]);

  useLayoutEffect(() => {
    if (sharedRouterRef) {
      throw new Error('Router只能有一个实例');
    }
    sharedRouterRef = routerRef;

    return () => {
      sharedRouterRef = null;
    };
  }, []);

  return <AppContainer {...props} ref={routerRef} />;
}

export default Router;

export function getSharedRouterRef() {
  if (!sharedRouterRef || !sharedRouterRef.current) {
    throw new Error('路由还没准备好');
  }

  return sharedRouterRef.current;
}
