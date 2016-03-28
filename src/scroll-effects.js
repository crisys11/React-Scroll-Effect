import React, {PropTypes} from 'react';
import classNames from 'classnames';
require('./animate.css');

export default class ScrollEffect extends React.Component {
    static propTypes = {
      callback: PropTypes.func,
      duration: PropTypes.number,
      queueClass: PropTypes.string,
      animate: PropTypes.string,
      offset: PropTypes.number,
      queueDuration: PropTypes.number
    };

    static defaultProps = {
      animate: 'fadeInUp',
      offset: 0,
      className: '',
      duration: 1,
      queueDuration: 1,
      queueClass: '',
      callback: () => {}
    };

    state = {
        animated: false
    };

    componentDidMount() {
      window.addEventListener('scroll', throttle(200, this.handleScroll.bind(this)));
    }

    componentWillUnmount() {
      window.removeEventListener('scroll', this.handleScroll.bind(this));
    }

    singleAnimate() {
        this.setState({
            animated: true
        });
        /* callback */
        setTimeout(() => {
          this.props.callback();
        }, this.props.duration * 1000);
    }

    queueAnimate() {
      let element = React.findDOMNode(this);
      let checkClass = (el) => {
        return el.className === this.props.queueClass;
      };
      let number = 0;
      let setClass = (el) => {
        el.style.visibility = 'hidden';
        setTimeout(() => {
          el.style.visibility = 'visible';
          el.className = el.className + ' animated ' + this.props.animate;
        }, number * (this.props.queueDuration * 1000));
        number++;
      };
      let findClass = (element) => {
          Array.prototype.forEach.call(element.childNodes, function(child) {
            findClass(child);
            if (checkClass(child)) {
              setClass(child);
            }
          });
      };
      /* find queue classes */
      findClass(element);

      /* callback */
      setTimeout(() => {
          this.props.callback();
      }, this.props.duration * 1000 * number);
    }

    handleScroll() {
      if (!this.state.animated) {
        let element = React.findDOMNode(this);
        let elementPositionY = element.getBoundingClientRect().top + document.body.scrollTop,
          scrollPositionY = window.scrollY,
          windowHeight = window.innerHeight;
        if (scrollPositionY + windowHeight / 2 >= elementPositionY + this.props.offset * 1) {
          this.setState({
              animated: true
          });
          if(this.props.queueClass !== '') {
            return this.queueAnimate();
          }
          this.singleAnimate();
        }
      }
    }

    render() {
      const {
        props, state
      } = this;
      let cn = classNames('animated', {
        [props.animate]: state.animated && props.queueClass === ''
      });
      let style = state.animated ? {} : {
        visibility: 'hidden'
      };
      cn += `, ${props.className}`;

      if (props.duration !== '') {
          style.WebkitAnimationDuration = props.duration + 's';
          style.animationDuration = props.duration + 's';
      }
      return <div className = {cn} style = {style}>{props.children}</div>;
    }
}

function throttle(delay, callback) {
  let previousCall = new Date().getTime();
  return () => {
    let time = new Date().getTime();
    if ((time - previousCall) >= delay) {
      previousCall = time;
      callback.apply(null, arguments);
    }
  };
}
