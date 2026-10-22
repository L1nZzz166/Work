import * as api from './api';
import {
    UserPageQuery,
    AddReq,
    DelReq,
    EditReq,
    CreateCrudOptionsProps,
    CreateCrudOptionsRet
} from '@fast-crud/fast-crud';
import { auth } from '/@/utils/authFunction';

export const createCrudOptions = function ({ crudExpose }: CreateCrudOptionsProps): CreateCrudOptionsRet {
    const pageRequest = async (query: UserPageQuery) => {
        return await api.GetList(query);
    };
    const editRequest = async ({ form, row }: EditReq) => {
        form.id = row.id;
        return await api.UpdateObj(form);
    };
    const delRequest = async ({ row }: DelReq) => {
        return await api.DelObj(row.id);
    };
    const addRequest = async ({ form }: AddReq) => {
        return await api.AddObj(form);
    };

    return {
        crudOptions: {
            request: {
                pageRequest,
                addRequest,
                editRequest,
                delRequest,
            },
            table: {
                rowKey: 'id',
            },
            actionbar: {
                buttons: {
                    add: { show: auth('scenic:Create'), text: '新增景点' },
                },
            },
            rowHandle: {
                fixed: 'right',
                width: 160,
                buttons: {
                    view: { show: false },
                    edit: { show: auth('scenic:Update'), text: '编辑' },
                    remove: { show: auth('scenic:Delete'), text: '删除' },
                },
            },
            columns: {
                _index: {
                    title: '序号',
                    form: { show: false },
                    column: { type: 'index', align: 'center', width: '60px', columnSetDisabled: true },
                },
                name: {
                    title: '景点名称',
                    type: 'input',
                    search: { show: true },
                    column: { minWidth: 180 },
                    form: {
                        rules: [{ required: true, message: '请输入景点名称' }],
                        component: { placeholder: '请输入景点名称' },
                    },
                },
                region_name: {
                    title: '地区',
                    type: 'input',
                    search: { show: true },
                    column: { minWidth: 90 },
                    form: { component: { placeholder: '如：北京' } },
                },
                level: {
                    title: '景区等级',
                    type: 'input',
                    search: { show: true },
                    column: { minWidth: 90 },
                },
                hot_score: {
                    title: '热度评分',
                    type: 'number',
                    column: { minWidth: 90 },
                    form: { component: { min: 0, max: 10 } },
                },
                review_score: {
                    title: '评论分',
                    type: 'number',
                    column: { minWidth: 90 },
                },
                review_count: {
                    title: '评论数量',
                    type: 'number',
                    column: { minWidth: 100 },
                },
                ticket_price: {
                    title: '门票价格',
                    type: 'number',
                    column: { minWidth: 90 },
                },
                type_desc: {
                    title: '类型',
                    type: 'input',
                    column: { minWidth: 90 },
                },
                category: {
                    title: '分类信息',
                    type: 'input',
                    column: { minWidth: 160 },
                    form: { show: false },
                },
                tags: {
                    title: '标签',
                    type: 'input',
                    column: { minWidth: 180 },
                    form: { show: false },
                },
                image_url: {
                    title: '图片链接',
                    type: 'input',
                    column: { minWidth: 180, showOverflowTooltip: true },
                    form: { show: false },
                },
                detail_url: {
                    title: '详情页',
                    type: 'input',
                    column: { minWidth: 180, showOverflowTooltip: true },
                    form: { show: false },
                },
            },
        },
    };
};
