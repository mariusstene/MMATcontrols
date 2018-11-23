// @flow
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect, Provider } from "react-redux";
import * as actions from "../../Redux/Actions";
import { clone, isTrueOrNull, getStyling } from "../../CommonScripts";
import * as flowTypes from "../../flowTypes";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";

type Props = {
    allowSpace: boolean,
    allowSymbols: boolean,
    enabled?: boolean,
    fontSize?: number,
    heading?: string,
    height?: number,
    length?: number,
    onBlur?: (flowTypes.atomicBlurArguments) => void,
    onChange?: (flowTypes.atomicChangeArguments) => void,
    onSubmit?: () => void,
    padded?: boolean,
    paddingTop?: number,
    placeholder?: string,
    required?: boolean,
    restrictionType?: string,
    showBackground?: boolean,
    showBorders?: boolean,
    style?: flowTypes.styleType,
    tooltip?: string,
    value?: string,
    width?: number,
};

/**
 * For full documentation, see Storybook.
 */
class MariusControl extends Component<Props, {}> {
    static defaultProps = {
        allowSpace: true,
        allowSymbols: true,
        enabled: true,
        height: 48,
        padded: true,
        required: false,
        showBackground: true,
        showBorders: true,
        width: "100%",
    };

    textbox: any;

    render() {
        const {
            enabled,
            heading,
            length,
            onBlur,
            placeholder,
            restrictionType,
            tooltip,
            value,
        } = this.props;

        const inputFieldStyle = this.getStyle();

        return (
            <input
                data-id="Input"
                disabled={!enabled}
                onBlur={(e) => {
                    const { target } = e;
                    if (!target || !isTrueOrNull(enabled)) {
                        return;
                    }

                    let newValue = target.value;
                    if (value && length) {
                        newValue = value.substring(0, length);
                    }

                    if (onBlur) {
                        onBlur({
                            value: newValue,
                            changeType: "blurred",
                        });
                    }
                }}
                onChange={this.onChange}
                onKeyDown={this.keyPressed}
                placeholder={placeholder || heading}
                ref={(fc) => (this.textbox = fc)}
                style={inputFieldStyle}
                title={tooltip}
                type={restrictionType || "text"}
                value={value || ""}
            />
        );
    }

    /**
     * Called when the value of the field changes.
     */
    onChange = (event) => {
        if (!event) {
            return;
        }

        const { target } = event;
        if (!target) {
            return;
        }

        const { value } = target;
        let result = clone(value);

        const { allowSpace, allowSymbols } = this.props;
        if (allowSpace === false) {
            result = result.replace(" ", "");
        }

        if (allowSymbols === false) {
            result = result.replace(/[^a-zA-Z0-9 ]/g, "");
        }

        this.changeText(result);
    };

    /**
     * Called when the user presses a key.
     */
    keyPressed = (event) => {
        const { keyCode } = event;
        const { onSubmit } = this.props;

        if (keyCode === 13) {
            if (onSubmit) {
                onSubmit();
            }
        }
    };

    /**
     * Changes the text value for the field.
     */
    changeText = (newValue: string) => {
        const { length, onChange, value } = this.props;
        if (newValue === value) {
            return;
        }

        if (length && value && newValue && newValue.length > length) {
            newValue = value.substring(0, length);
        }

        if (onChange) {
            onChange({
                value: newValue,
                changeType: "changed",
            });
        }
    };

    /**
     * If unpadded, remove the padding from the field.
     */
    removePadding = (
        inputFieldStyle: flowTypes.styleType
    ): flowTypes.styleType => {
        if (
            inputFieldStyle.width &&
            typeof inputFieldStyle.width === "number"
        ) {
            if (
                inputFieldStyle.paddingLeft &&
                typeof inputFieldStyle.paddingLeft === "number"
            ) {
                inputFieldStyle.width += inputFieldStyle.paddingLeft;
                inputFieldStyle.paddingLeft = 0;
            }
            if (
                inputFieldStyle.paddingRight &&
                typeof inputFieldStyle.paddingRight === "number"
            ) {
                inputFieldStyle.width += inputFieldStyle.paddingRight;
                inputFieldStyle.paddingRight = 0;
            }
        }

        if (
            inputFieldStyle.height &&
            typeof inputFieldStyle.height === "number"
        ) {
            if (
                inputFieldStyle.paddingBottom &&
                typeof inputFieldStyle.paddingBottom === "number"
            ) {
                inputFieldStyle.height += inputFieldStyle.paddingBottom;
                inputFieldStyle.paddingBottom = 0;
            }
        }
        if (
            inputFieldStyle.height &&
            typeof inputFieldStyle.height === "number"
        ) {
            if (
                inputFieldStyle.paddingTop &&
                typeof inputFieldStyle.paddingTop === "number"
            ) {
                inputFieldStyle.height += inputFieldStyle.paddingTop;
                inputFieldStyle.paddingTop = 0;
            }
        }

        return inputFieldStyle;
    };

    getStyle = (): flowTypes.styleType => {
        const {
            fontSize,
            height,
            padded,
            paddingTop,
            required,
            showBackground,
            showBorders,
            style,
            value,
            width,
        } = this.props;

        let inputFieldStyle = null;
        if (style) {
            inputFieldStyle = style;

            if (width) {
                inputFieldStyle.width = width;
            }

            if (height) {
                inputFieldStyle.height = height;
            }
        } else {
            inputFieldStyle = getStyling({
                containerHeight: height,
                containerWidth: width,
                controlType: "input",
                controlValue: value,
                props: this.props,
                required,
            });
        }

        if (fontSize) {
            inputFieldStyle.fontSize = fontSize;
        }

        if (paddingTop) {
            inputFieldStyle.paddingTop = paddingTop;
        }

        if (!showBorders) {
            inputFieldStyle.border = "none";
            inputFieldStyle.boxShadow = "none";
        }

        if (!showBackground) {
            inputFieldStyle.backgroundColor = "transparent";
        }

        if (!isTrueOrNull(padded)) {
            inputFieldStyle = this.removePadding(inputFieldStyle);
        }

        return inputFieldStyle;
    };
}

function mapStateToProps(state) {
    return {
        accountReducer: state.accountReducer,
        stylingReducer: state.stylingReducer,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(actions, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MariusControl);

/**
 * Version with mock Redux store
 */
const middlewares = [thunk];
const mockStore = configureStore(middlewares);
const store = mockStore({});

export class MariusControlWithoutRedux extends Component<Props, {}> {
    render() {
        return (
            <Provider store={store}>
                <MariusControl {...this.props} />
            </Provider>
        );
    }
}
