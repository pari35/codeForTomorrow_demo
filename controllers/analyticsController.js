import { analyticsByCityServices, analyticsServices } from "../services/analyticService.js"

const analyticsController = async (req, res) => {

    try {

        const getAnalytics = await analyticsServices(req)
        res.status(201).json({
            succcess: true,
            data: getAnalytics
        })

    } catch (err) {
        console.log("err", err)
    }
}

const analyticsByCityController = async (req, res) => {
    try {

        if (!req.params.name) {
            res.status(401).json({
                message: "city name required in params "
            })
        }

        const getByCityAnalytics = await analyticsByCityServices(req)
        res.status(201).json({
            succcess: true,
            data: getByCityAnalytics
        })

    } catch (err) {
        console.log("err", err)
    }
}

export {
    analyticsController,
    analyticsByCityController
}