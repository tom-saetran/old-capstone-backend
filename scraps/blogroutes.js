/*blogPostRouter.get("/:id/asCSV", (req, res, next) => {
    try {
        const fields = ["title", "content", "comments", "author", "cover"]
        res.setHeader("Content-Disposition", `attachment; filename=${req.params.id}.csv`)
        pipeline(
            readBlogsStream(),
            filter(user => user.id === req.params.id),
            new Transform({ fields }),
            res,
            error => (error ? createError(500, error) : null)
        )
    } catch (error) {
        next(error)
    }
})*/

/*blogPostRouter.get("/asCSV", (req, res, next) => {
    try {
        const fields = ["title", "content", "comments", "author", "cover"]
        res.setHeader("Content-Disposition", `attachment; filename=${req.params.id}.csv`)
        //pipeline(readBlogsStream(), new Transform({ fields }), res, error => (error ? createError(500, error) : null))
    } catch (error) {
        next(error)
    }
})*/
