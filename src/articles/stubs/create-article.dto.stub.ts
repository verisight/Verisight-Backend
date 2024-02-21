import { CreateArticleDto } from "../dto/create-article.dto";

export const createArticleDtoStub = (): CreateArticleDto => {
    return {
        link: 'https://www.example.com',
        title: 'Example Title',
        content: 'Example Content',
        datePublished: '2021-01-01',
        prediction: 1
    };
};