<?php
/**
 * Created by PhpStorm.
 * User: 风哀伤
 * Date: 2018/6/28
 * Time: 15:20
 */

namespace app\modules\api\models;


use app\hejiang\ApiResponse;
use app\models\Goods;
use app\models\MiaoshaGoods;
use app\models\Model;
use app\models\MsGoods;
use app\models\Order;
use app\models\PtGoods;
use app\models\YyGoods;
use yii\data\Pagination;
use yii\db\Expression;
use yii\db\Query;

class SearchForm extends ApiModel
{
    public $store_id;

    public $limit;
    public $page;

    public $keyword;
    public $defaultCat;

    public function rules()
    {
        return [
            [['limit', 'page'], 'integer'],
            [['limit'], 'default', 'value' => 20],
            [['keyword'], 'trim'],
            [['keyword'], 'string']
        ];
    }

    public function search()
    {
        if (!$this->validate()) {
            return $this->errorResponse;
        }
        $select = ['id', 'name', 'sort', 'addtime', 'price', 'cover_pic pic_url', 'store_id', 'status', 'is_delete'];
        switch ($this->defaultCat->key) {
            case 'm' :
                $query = (new Query())->from([Goods::tableName()])->select($select)->andWhere(['type'=>get_plugin_type()]);
                break;
            case 'ms':
                $query = (new Query())->from(['ms' => MsGoods::tableName()])->innerJoin(['mg' => MiaoshaGoods::tableName()], 'mg.goods_id=ms.id')
                    ->where([
                        'mg.open_date' => date('Y-m-d'),
                        'mg.start_time' => date('H'),
                        'mg.is_delete' => 0,
                        'ms.store_id' => $this->getCurrentStoreId()
                    ])->select([
                        'mg.id', 'ms.name', 'ms.sort',
                        'ms.addtime', 'ms.original_price price',
                        'ms.cover_pic pic_url', 'ms.store_id',
                        'ms.status', 'ms.is_delete'
                    ]);
                break;
            case 'pt':
                $query = (new Query())->from([PtGoods::tableName()])->select($select);
                break;
            case 'yy':
                $query = (new Query())->from([YyGoods::tableName()])->select($select);
                break;
            default:
                $query = (new Query())->from([Goods::tableName()])->select($select);
                break;
        }

        // 秒杀比较特殊
        if ($this->defaultCat->key !== 'ms') {
            $query->andWhere(['status' => 1, 'is_delete' => Model::IS_DELETE_FALSE]);
        }

        if ($this->store_id && $this->defaultCat->key !== 'ms') {
            $query->andWhere(['store_id' => $this->store_id]);
        }
        if ($this->keyword) {
            $keywords = $this->ch2arr($this->keyword);
            foreach ($keywords as $item) {
                $query->andWhere(['LIKE', 'name', $item]);
            }

        }

        $count = $query->count(1);

        $pagination = new Pagination(['totalCount' => $count, 'pageSize' => $this->limit, 'page' => $this->page - 1]);
        //综合，自定义排序+时间最新
        $query->orderBy('sort ASC, addtime DESC');

        $list = $query->limit($pagination->limit)->offset($pagination->offset)->all();

        foreach ($list as $k => $item) {
            $list[$k]['url'] = $this->defaultCat->url . $item['id'];
        }

        $data = [
            'row_count' => $count,
            'page_count' => $pagination->pageCount,
            'list' => $list,
        ];

        return new ApiResponse(0, 'success', $data);
    }

    function ch2arr($str)
    {
        $length = mb_strlen($str, 'utf-8');
        $array = [];
        for ($i=0; $i<$length; $i++)
            $array[] = mb_substr($str, $i, 1, 'utf-8');
        return $array;
    }


    public function cats()
    {
        $storePermissions = \Yii::$app->controller->getStorePermissions();
        $cats = [
            'list' => [
                [
                    'id' => 0,
                    'name' => '默认',
                    'key' => 'm',
                    'url' => '/pages/goods/goods?id='
                ],
                [
                    'id' => 1,
                    'name' => '秒杀',
                    'key' => 'ms',
                    'url' => '/pages/miaosha/details/details?id='
                ],
                [
                    'id' => 2,
                    'name' => '拼团',
                    'key' => 'pt',
                    'url' => '/pages/pt/details/details?gid='
                ],
                [
                    'id' => 3,
                    'name' => '预约',
                    'key' => 'yy',
                    'url' => '/pages/book/details/details?id='
                ]
            ],
            'default_cat' => [
                'id' => 0,
                'name' => '默认',
                'key' => 'm',
                'url' => '/pages/goods/goods?id='
            ]
        ];

        // TODO key值应该与插件名统一，这样循环就不用这么复杂
        // 搜索分类根据插件权限显示
        foreach ($cats['list'] as $k => $v) {
            if ($v['key'] === 'ms' && !in_array('miaosha', $storePermissions)) {
                unset($cats['list'][$k]);
            }
            if ($v['key'] === 'pt' && !in_array('pintuan', $storePermissions)) {
                unset($cats['list'][$k]);
            }
            if ($v['key'] === 'yy' && !in_array('book', $storePermissions)) {
                unset($cats['list'][$k]);
            }
        }

        return $cats;
    }
}
