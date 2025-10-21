import CustomizerProvider from './Helper/Customizer/CustomizerProvider'
import AnimationThemeProvider from './Helper/AnimationTheme/AnimationThemeProvider'
import UserState from './Context/UserContextState'
import { TimezonesProvider } from './Context/TimezoneContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateMomentUtils from '@date-io/moment';



const TestProvider = ({ children }) => {
    const client = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                refetchOnMount: false,
            }
        }
    })

    return (
        <>
            <TimezonesProvider>
                <QueryClientProvider client={client}>
                    <UserState>
                        <CustomizerProvider>
                            <AnimationThemeProvider>
                                <MuiPickersUtilsProvider utils={DateMomentUtils}>
                                    {children}
                                </MuiPickersUtilsProvider>
                            </AnimationThemeProvider>
                        </CustomizerProvider>
                    </UserState>
                </QueryClientProvider>
            </TimezonesProvider>
        </>
    )
}

export default TestProvider;