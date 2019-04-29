<?php

/**
 * link: http://www.zjhejiang.com/
 * copyright: Copyright (c) 2018 浙江禾匠信息科技有限公司
 * author: wxf
 */

namespace app\models\common;


use app\models\Attr;
use app\models\AttrGroup;
use app\models\Model;

class CommonGoodsAttr
{

    /**
     * 给规格列表添加个 规格组名称字段
     * @param array $goods
     * @return array
     */
    public static function getCheckedAttr($goods)
    {
        $storeId = \Yii::$app->controller->store->id;

        $attr = is_string($goods['attr']) ? \Yii::$app->serializer->decode($goods['attr']) : $goods['attr'];

        $newAttr = [];
        foreach ($attr as $k => $item) {
            $newAttr[$k] = $item;
        }

        foreach ($newAttr as $k => $item) {
            foreach ($item['attr_list'] as $k2 => $item2) {
                $attr = Attr::find()->where(['id' => $item2['attr_id'], 'is_delete' => Model::IS_DELETE_FALSE])->asArray()->one();
                $cache_key = 'attr_group_by_attr_' . $attr['attr_group_id'];
                $attrGroup = \Yii::$app->cache->get($cache_key);

                if (!$attrGroup) {
                    $attrGroup = AttrGroup::find()->where(['id' => $attr['attr_group_id'], 'store_id' => $storeId])->asArray()->one();
                    \Yii::$app->cache->set($cache_key, $attrGroup, 1);

                }

                $newAttr[$k]['attr_list'][$k2]['attr_group_name'] = $attrGroup['attr_group_name'];
            }
        }

        return $newAttr;
    }
}
