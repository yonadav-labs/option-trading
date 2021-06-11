import { grey } from '@material-ui/core/colors';
import { createTheme, responsiveFontSizes } from '@material-ui/core/styles'
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import colors from "./colors";

export default responsiveFontSizes(createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: colors.orange,
            dark: 'rgba(217, 111, 17, 1)',
            light: 'rgba(255, 179, 111, 1)',
            background: 'rgba(255, 143, 43, 0.08)',
            border: 'rgba(255, 143, 43, 0.5)',
            contrastText: 'rgba(255, 255, 255, 1)'
        },
        secondary: {
            main: colors.yellow,
            dark: 'rgba(232, 187, 30, 1)',
            light: 'rgba(255, 231, 148, 1)',
            background: 'rgba(255, 211, 56, 0.08)',
            border: 'rgba(255, 211, 56, 0.5)',
            contrastText: 'rgba(255, 255, 255, 1)'
        },
        warning: {
            main: colors.purple,
        },
        divider: colors.light,
    },
    typography: {
        fontFamily: 'Roboto',
        h1: {
            fontFamily: "Roboto",
            fontSize: '5rem',
            fontWeight: 'normal',
            lineHeight: 1,
            letterSpacing: '-0.071em',
        },
        h2: {
            fontFamily: "Roboto",
            fontSize: '4.286rem',
            fontWeight: 'normal',
            lineHeight: 1.1,
            letterSpacing: '-0.071em',
        },
        h3: {
            fontFamily: "Roboto",
            fontSize: '2.857rem',
            fontWeight: 'normal',
            lineHeight: 1.2,
            letterSpacing: '-0.071em',
        },
        h4: {
            fontFamily: "Roboto",
            fontSize: '2rem',
            fontWeight: 'normal',
            lineHeight: 1.1,
        },
        h5: {
            fontFamily: "Roboto",
            fontSize: '1.5rem',
            fontWeight: 'bold',
            lineHeight: 1.2,
        },
        h6: {
            fontFamily: "Roboto",
            fontSize: '1.286rem',
            fontWeight: 'bold',
            lineHeight: 1.2,
        },
        subtitle1: {
            fontFamily: "Roboto",
            fontSize: '1.143rem',
            fontWeight: 500,
            lineHeight: 1.4,
        },
        subtitle2: {
            fontFamily: "Roboto",
            fontSize: '16px',
            fontWeight: 500,
        },
        body1: {
            fontFamily: "Roboto",
            fontSize: '1.143rem',
            fontWeight: 'normal',
            lineHeight: 1.6,
        },
        body2: {
            fontFamily: "Roboto",
            fontSize: '1rem',
            fontWeight: 'normal',
            lineHeight: 1.5,
        },
        button: {
            fontFamily: "Roboto",
            fontSize: '0.9rem',
            fontWeight: 'bold',
            lineHeight: 1.3,
            letterSpacing: '0.071em',
            textTransform: 'uppercase'
        },
        fieldLabel: {
            fontFamily: "Roboto",
            fontSize: '12px',
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: '1px',
            textTransform: 'uppercase'
        }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                contained: {
                    border: 0,
                    boxShadow: 'none',
                    transition: 'ease-in-out',
                    WebkitTransition: 'ease-in-out',
                },
                containedPrimary: {
                    background: 'linear-gradient(90deg, #FF8F2B 0%, #FFD43A 100%)',
                    '&:disabled': {
                        background: 'rgba(0, 0, 0, 0.12)'
                    },
                    '&:hover': {
                        background: colors.orange,
                        color: colors.white,
                        boxShadow: 'none',
                    }
                },
                containedSecondary: {
                    background: grey[900],
                    '&:hover': {
                        background: grey[700],
                        boxShadow: 'none',
                    }
                },
                outlined: {
                    color: 'black',
                    background: colors.white,
                    textAlign: 'center',
                    '&:hover': {
                        color: 'black',
                    }
                },
                sizeSmall: {
                    padding: '4px 10px 4px 10px',
                },
                sizeMedium: {
                    padding: '6px 16px 6px 16px',
                },
                sizeLarge: {
                    padding: '12px 20px 12px 20px',
                },
            },
            // variants: [
            //     {
            //         props: { variant: 'secondary' },
            //         style: {
            //             background: colors.light2,
            //             boxShadow: 'none',
            //             color: colors.gray,
            //             height: 40,
            //             padding: '14px 22px 13px',
            //             transition: 'ease-in-out',
            //             WebkitTransition: 'ease-in-out',
            //             '&:disabled': {
            //                 borderColor: 'linear-gradient(90deg, #FF8F2B 0%, #FFD43A 100%)',
            //                 border: '1px',
            //                 color: colors.gray,
            //                 opacity: 0.5
            //             },
            //             '&:hover': {
            //                 background: colors.light2,
            //                 color: colors.orange,
            //                 boxShadow: 'none',
            //             }
            //         }
            //     }
            // ]
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    opacity: 1,
                }
            }
        },
        MuiSelect: {
            styleOverrides: {
                icon: {
                    color: colors.orange
                }
            },
            defaultProps: {
                IconComponent: ExpandMoreIcon
            }
        },
        MuiAutocomplete: {
            styleOverrides: {
                popupIndicator: {
                    '& span': {
                        '& svg': {
                            color: colors.orange,
                            '& path': {
                                d: 'path("M 16.59 8.59 L 12 13.17 L 7.41 8.59 L 6 10 l 6 6 l 6 -6 Z")'
                            }
                        }
                    }
                }
            }
        },
        MuiPaginationItem: {
            variants: [
                {
                    props: { variant: 'text' }
                }
            ]
        }
    },
    shape: {
        borderRadius: 4,
    },
}));
