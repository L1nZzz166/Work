import { request } from '/@/utils/service';
import { PageQuery, AddReq, DelReq, EditReq } from '@fast-crud/fast-crud';

export const apiPrefix = '/api/tourism/scenic/';

export function GetList(query: PageQuery) {
    return request({
        url: apiPrefix,
        method: 'get',
        params: query,
    });
}

export function GetObj(id: number) {
    return request({
        url: apiPrefix + id + '/',
        method: 'get',
    });
}

export function AddObj(obj: AddReq) {
    return request({
        url: apiPrefix,
        method: 'post',
        data: obj,
    });
}

export function UpdateObj(obj: EditReq) {
    return request({
        url: apiPrefix + obj.id + '/',
        method: 'put',
        data: obj,
    });
}

export function DelObj(id: DelReq) {
    return request({
        url: apiPrefix + id + '/',
        method: 'delete',
        data: { id },
    });
}

// 推荐相关接口
export function GetRecommend(params: any) {
    return request({ url: apiPrefix + 'recommend/', method: 'get', params });
}

export function GetTop(params: any) {
    return request({ url: apiPrefix + 'top/', method: 'get', params });
}

export function GetSimilar(params: any) {
    return request({ url: apiPrefix + 'similar/', method: 'get', params });
}

export function GetStats(params: any) {
    return request({ url: apiPrefix + 'stats/', method: 'get', params });
}

export function GetRegions(params: any) {
    return request({ url: apiPrefix + 'regions/', method: 'get', params });
}
